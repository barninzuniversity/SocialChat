#!/usr/bin/env python
"""
Script to backup media files to a compressed archive.
This is useful for backing up user uploads when using local file storage.
"""

import os
import sys
import datetime
import shutil
import argparse

def create_backup(media_dir, backup_dir):
    """Create a compressed backup of the media directory."""
    if not os.path.exists(media_dir):
        print(f"Error: Media directory '{media_dir}' does not exist.")
        return False
    
    if not os.path.exists(backup_dir):
        try:
            os.makedirs(backup_dir)
            print(f"Created backup directory: {backup_dir}")
        except OSError as e:
            print(f"Error creating backup directory: {e}")
            return False
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"media_backup_{timestamp}.tar.gz"
    backup_path = os.path.join(backup_dir, backup_filename)
    
    try:
        # Create a compressed archive
        print(f"Creating backup at {backup_path}...")
        shutil.make_archive(
            os.path.splitext(backup_path)[0],  # Remove .gz extension
            'gztar',
            os.path.dirname(media_dir),
            os.path.basename(media_dir)
        )
        print(f"Backup successfully created at {backup_path}")
        return True
    except Exception as e:
        print(f"Error creating backup: {e}")
        return False

def cleanup_old_backups(backup_dir, keep_days):
    """Remove backups older than the specified number of days."""
    if not os.path.exists(backup_dir):
        print(f"Backup directory '{backup_dir}' does not exist.")
        return
    
    print(f"Cleaning up backups older than {keep_days} days...")
    now = datetime.datetime.now()
    count = 0
    
    for filename in os.listdir(backup_dir):
        if filename.startswith("media_backup_") and filename.endswith(".tar.gz"):
            backup_path = os.path.join(backup_dir, filename)
            file_time = datetime.datetime.fromtimestamp(os.path.getmtime(backup_path))
            age_days = (now - file_time).days
            
            if age_days > keep_days:
                try:
                    os.remove(backup_path)
                    count += 1
                    print(f"Removed old backup: {filename} (age: {age_days} days)")
                except OSError as e:
                    print(f"Error removing old backup {filename}: {e}")
    
    print(f"Cleanup complete. Removed {count} old backups.")

def main():
    parser = argparse.ArgumentParser(description="Backup media files from Django project.")
    parser.add_argument("--media-dir", default="media", help="Path to the media directory")
    parser.add_argument("--backup-dir", default="backups", help="Directory to store backups")
    parser.add_argument("--keep-days", type=int, default=30, help="Number of days to keep backups")
    parser.add_argument("--cleanup-only", action="store_true", help="Only cleanup old backups without creating new ones")
    
    args = parser.parse_args()
    
    # Get absolute paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    media_dir = os.path.join(script_dir, args.media_dir)
    backup_dir = os.path.join(script_dir, args.backup_dir)
    
    if not args.cleanup_only:
        success = create_backup(media_dir, backup_dir)
        if not success:
            sys.exit(1)
    
    cleanup_old_backups(backup_dir, args.keep_days)

if __name__ == "__main__":
    main() 