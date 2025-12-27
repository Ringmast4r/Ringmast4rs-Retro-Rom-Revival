#!/usr/bin/env python3
"""
Build ROM Game Database
Creates SQLite database and JSON export from NAS ROM index
"""

import sqlite3
import json
import re
import os
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
TSV_FILE = SCRIPT_DIR / "rom_index.tsv"
DB_FILE = SCRIPT_DIR / "games.db"
JSON_FILE = SCRIPT_DIR / "games.json"

def parse_platform(folder_path):
    """Extract platform info from folder path like '/mnt/seagate/ROMS/1983 - Nintendo - NES'"""
    # Get the platform folder (first level under ROMS)
    match = re.search(r'/ROMS/([^/]+)', folder_path)
    if not match:
        return None, None, None, None

    platform_folder = match.group(1)

    # Parse "Year - Manufacturer - Console" format
    parts = platform_folder.split(' - ')
    if len(parts) >= 3:
        year = parts[0].strip()
        manufacturer = parts[1].strip()
        console = ' - '.join(parts[2:]).strip()  # Handle consoles with dashes
    elif len(parts) == 2:
        year = parts[0].strip()
        manufacturer = ""
        console = parts[1].strip()
    else:
        year = ""
        manufacturer = ""
        console = platform_folder

    return year, manufacturer, console, platform_folder

def format_size(size_bytes):
    """Format file size in human readable format"""
    size = int(size_bytes)
    if size < 1024:
        return f"{size} B"
    elif size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"
    elif size < 1024 * 1024 * 1024:
        return f"{size / (1024*1024):.1f} MB"
    else:
        return f"{size / (1024*1024*1024):.2f} GB"

def clean_game_name(filename):
    """Clean up game name from filename"""
    # Remove extension
    name = os.path.splitext(filename)[0]

    # Remove common tags in parentheses/brackets but keep region
    # Keep (USA), (Europe), (Japan), etc but remove (Rev 1), (Alt), etc

    return name

def get_region(filename):
    """Extract region from filename"""
    regions = []
    if '(USA)' in filename or '(U)' in filename:
        regions.append('USA')
    if '(Europe)' in filename or '(E)' in filename or '(En)' in filename:
        regions.append('Europe')
    if '(Japan)' in filename or '(J)' in filename or '(Jp)' in filename:
        regions.append('Japan')
    if '(World)' in filename or '(W)' in filename:
        regions.append('World')
    if '(Germany)' in filename or '(De)' in filename:
        regions.append('Germany')
    if '(France)' in filename or '(Fr)' in filename:
        regions.append('France')
    if '(Spain)' in filename or '(Es)' in filename:
        regions.append('Spain')
    if '(Italy)' in filename or '(It)' in filename:
        regions.append('Italy')

    return ', '.join(regions) if regions else 'Unknown'

def build_database():
    """Build SQLite database from TSV index"""
    print(f"Reading {TSV_FILE}...")

    # Create database
    if DB_FILE.exists():
        DB_FILE.unlink()

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Create tables
    cursor.execute('''
        CREATE TABLE games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            game_name TEXT NOT NULL,
            platform TEXT NOT NULL,
            platform_folder TEXT NOT NULL,
            manufacturer TEXT,
            year TEXT,
            region TEXT,
            size_bytes INTEGER,
            size_human TEXT,
            extension TEXT,
            full_path TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE platforms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            folder_name TEXT UNIQUE NOT NULL,
            year TEXT,
            manufacturer TEXT,
            console TEXT,
            game_count INTEGER DEFAULT 0,
            total_size INTEGER DEFAULT 0
        )
    ''')

    # Read and parse TSV
    games = []
    platforms = {}

    with open(TSV_FILE, 'r', encoding='utf-8', errors='replace') as f:
        for line_num, line in enumerate(f, 1):
            parts = line.strip().split('\t')
            if len(parts) != 3:
                continue

            size_bytes, folder_path, filename = parts

            try:
                size_bytes = int(size_bytes)
            except ValueError:
                size_bytes = 0

            year, manufacturer, console, platform_folder = parse_platform(folder_path)
            if not platform_folder:
                continue

            # Track platform stats
            if platform_folder not in platforms:
                platforms[platform_folder] = {
                    'year': year,
                    'manufacturer': manufacturer,
                    'console': console,
                    'count': 0,
                    'size': 0
                }
            platforms[platform_folder]['count'] += 1
            platforms[platform_folder]['size'] += size_bytes

            # Get file extension
            ext = os.path.splitext(filename)[1].lower()

            games.append((
                filename,
                clean_game_name(filename),
                console or platform_folder,
                platform_folder,
                manufacturer,
                year,
                get_region(filename),
                size_bytes,
                format_size(size_bytes),
                ext,
                folder_path + '/' + filename
            ))

            if line_num % 10000 == 0:
                print(f"  Processed {line_num} files...")

    print(f"  Total: {len(games)} games")

    # Insert games
    print("Inserting games into database...")
    cursor.executemany('''
        INSERT INTO games (filename, game_name, platform, platform_folder, manufacturer, year, region, size_bytes, size_human, extension, full_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', games)

    # Insert platforms
    print("Inserting platforms...")
    for folder, data in platforms.items():
        cursor.execute('''
            INSERT INTO platforms (folder_name, year, manufacturer, console, game_count, total_size)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (folder, data['year'], data['manufacturer'], data['console'], data['count'], data['size']))

    # Create indexes for fast searching
    print("Creating indexes...")
    cursor.execute('CREATE INDEX idx_game_name ON games(game_name)')
    cursor.execute('CREATE INDEX idx_platform ON games(platform)')
    cursor.execute('CREATE INDEX idx_year ON games(year)')
    cursor.execute('CREATE INDEX idx_manufacturer ON games(manufacturer)')
    cursor.execute('CREATE INDEX idx_region ON games(region)')

    # Create FTS virtual table for full-text search
    cursor.execute('''
        CREATE VIRTUAL TABLE games_fts USING fts5(
            game_name, platform, manufacturer, region,
            content='games',
            content_rowid='id'
        )
    ''')
    cursor.execute('''
        INSERT INTO games_fts(rowid, game_name, platform, manufacturer, region)
        SELECT id, game_name, platform, manufacturer, region FROM games
    ''')

    conn.commit()

    # Get stats
    cursor.execute('SELECT COUNT(*) FROM games')
    game_count = cursor.fetchone()[0]
    cursor.execute('SELECT COUNT(*) FROM platforms')
    platform_count = cursor.fetchone()[0]
    cursor.execute('SELECT SUM(size_bytes) FROM games')
    total_size = cursor.fetchone()[0]

    print(f"\nDatabase created: {DB_FILE}")
    print(f"  Games: {game_count:,}")
    print(f"  Platforms: {platform_count}")
    print(f"  Total Size: {format_size(total_size)}")

    conn.close()
    return game_count, platform_count

def export_json():
    """Export database to JSON for web search"""
    print(f"\nExporting to JSON...")

    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get all games
    cursor.execute('''
        SELECT id, filename, game_name, platform, manufacturer, year, region, size_bytes, size_human, extension
        FROM games
        ORDER BY platform, game_name
    ''')

    games = []
    for row in cursor.fetchall():
        games.append({
            'id': row['id'],
            'name': row['game_name'],
            'file': row['filename'],
            'platform': row['platform'],
            'mfr': row['manufacturer'],
            'year': row['year'],
            'region': row['region'],
            'size': row['size_human'],
            'bytes': row['size_bytes'],
            'ext': row['extension']
        })

    # Get platforms for filter dropdown
    cursor.execute('''
        SELECT folder_name, year, manufacturer, console, game_count, total_size
        FROM platforms
        ORDER BY year, console
    ''')

    platforms = []
    for row in cursor.fetchall():
        platforms.append({
            'folder': row['folder_name'],
            'year': row['year'],
            'mfr': row['manufacturer'],
            'console': row['console'],
            'count': row['game_count'],
            'size': row['total_size']
        })

    # Get unique values for filters
    cursor.execute('SELECT DISTINCT manufacturer FROM platforms WHERE manufacturer != "" ORDER BY manufacturer')
    manufacturers = [row[0] for row in cursor.fetchall()]

    cursor.execute('SELECT DISTINCT year FROM platforms WHERE year != "" ORDER BY year')
    years = [row[0] for row in cursor.fetchall()]

    conn.close()

    # Build JSON structure
    data = {
        'generated': __import__('datetime').datetime.now().isoformat(),
        'stats': {
            'games': len(games),
            'platforms': len(platforms)
        },
        'filters': {
            'manufacturers': manufacturers,
            'years': years
        },
        'platforms': platforms,
        'games': games
    }

    # Write JSON
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))  # Minified

    # Also create a pretty version for debugging
    with open(SCRIPT_DIR / "games_pretty.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    file_size = JSON_FILE.stat().st_size
    print(f"JSON exported: {JSON_FILE}")
    print(f"  Size: {format_size(file_size)}")

    return len(games)

if __name__ == '__main__':
    print("=" * 60)
    print("ROM Game Database Builder")
    print("=" * 60)

    if not TSV_FILE.exists():
        print(f"Error: {TSV_FILE} not found!")
        print("Run the NAS indexer first to generate rom_index.tsv")
        exit(1)

    game_count, platform_count = build_database()
    export_json()

    print("\n" + "=" * 60)
    print("Done! Files created:")
    print(f"  - {DB_FILE} (SQLite database)")
    print(f"  - {JSON_FILE} (Web search data)")
    print("=" * 60)
