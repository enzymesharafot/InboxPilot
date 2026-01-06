#!/bin/bash
# Quick script to transfer Gmail accounts to the specified user

if [ -z "$1" ]; then
    echo "Usage: ./transfer.sh <target_username>"
    echo ""
    echo "Example: ./transfer.sh isharafot728@gmail.com"
    echo ""
    echo "Available users:"
    cd /media/inzamul-sharafot/Data/InboxPilot/backend
    source venv/bin/activate
    python manage.py shell << 'EOF'
from django.contrib.auth.models import User
for user in User.objects.all():
    print(f"  - {user.username}")
EOF
    exit 1
fi

TARGET_USER="$1"

echo "================================================"
echo "Transferring Gmail accounts to: $TARGET_USER"
echo "================================================"

cd /media/inzamul-sharafot/Data/InboxPilot/backend
source venv/bin/activate

python manage.py shell << EOF
from django.contrib.auth.models import User
from api.models import EmailAccount

try:
    from_user = User.objects.get(username='i@gmail.com')
    to_user = User.objects.get(username='$TARGET_USER')
    
    accounts = EmailAccount.objects.filter(user=from_user, provider='gmail')
    count = accounts.count()
    
    if count == 0:
        print("❌ No Gmail accounts to transfer")
    else:
        print(f"Transferring {count} account(s)...")
        for acc in accounts:
            print(f"  • {acc.email_address}")
        
        accounts.update(user=to_user)
        print(f"\n✅ Success! {count} account(s) transferred to {to_user.username}")
        print("\nNow refresh your browser dashboard to see the accounts!")
        
except User.DoesNotExist:
    print(f"❌ Error: User '$TARGET_USER' not found")
except Exception as e:
    print(f"❌ Error: {e}")
EOF

echo "================================================"
