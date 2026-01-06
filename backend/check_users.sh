#!/bin/bash

echo "================================================"
echo "QUICK FIX: Transfer Gmail Accounts to Your User"
echo "================================================"
echo ""
echo "Current situation:"
echo "  • Gmail accounts are owned by: i@gmail.com"
echo "  • You need to transfer them to YOUR user"
echo ""
echo "Which user do you want to transfer the accounts to?"
echo ""

cd /media/inzamul-sharafot/Data/InboxPilot/backend
source venv/bin/activate

python manage.py shell << 'EOF'
from django.contrib.auth.models import User

print("Available users:")
for i, user in enumerate(User.objects.all().order_by('-date_joined'), 1):
    print(f"  {i}. {user.username} ({user.email})")

print("\nEnter the username you want to transfer to:")
print("Example: isharafot728@gmail.com")
EOF

echo ""
echo "================================================"
echo "To transfer, run:"
echo "  cd /media/inzamul-sharafot/Data/InboxPilot/backend"
echo "  python transfer_accounts.py YOUR_USERNAME"
echo "================================================"
