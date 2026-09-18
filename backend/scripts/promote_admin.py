import argparse
from sqlalchemy import select
from backend.app.db import SessionLocal
from backend.app.entities import User

parser=argparse.ArgumentParser(description="Promote an existing local Lollipop account to ADMIN.")
parser.add_argument("email")
args=parser.parse_args()

db=SessionLocal()
try:
    user=db.scalar(select(User).where(User.email==args.email.lower()))
    if not user:
        raise SystemExit("User not found. Register the account first.")
    user.role="ADMIN"
    db.commit()
    print(f"ADMIN role granted to {user.email}")
finally:
    db.close()
