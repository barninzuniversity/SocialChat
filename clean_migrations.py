import sqlite3

# Connect to DB
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Delete problematic migrations
sql = '''DELETE FROM django_migrations 
         WHERE app="chat" AND 
         (name LIKE "0007%" OR 
          name LIKE "0008%" OR 
          name LIKE "0009%" OR 
          name LIKE "0010%" OR 
          name LIKE "0011%")'''

cursor.execute(sql)
print(f"Deleted {cursor.rowcount} rows from django_migrations table")

# Commit and close
conn.commit()
conn.close() 