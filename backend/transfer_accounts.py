#!/usr/bin/env python
"""
Script to transfer Gmail accounts from one user to another
Usage: python manage.py shell < transfer_accounts.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inboxpilot.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import EmailAccount

def transfer_accounts(from_username, to_username):
    """Transfer all Gmail accounts from one user to another"""
    
    try:
        from_user = User.objects.get(username=from_username)
        to_user = User.objects.get(username=to_username)
        
        print(f"\n{'='*60}")
        print(f"Transferring accounts FROM: {from_user.username}")
        print(f"                      TO: {to_user.username}")
        print(f"{'='*60}\n")
        
        accounts = EmailAccount.objects.filter(user=from_user)
        
        if accounts.count() == 0:
            print(f"❌ No accounts found for user: {from_username}")
            return
        
        print(f"Found {accounts.count()} account(s) to transfer:\n")
        for acc in accounts:
            print(f"  • {acc.email_address} ({acc.provider})")
        
        # Transfer
        updated = accounts.update(user=to_user)
        
        print(f"\n✅ Successfully transferred {updated} account(s)!")
        print(f"\nNow login as '{to_username}' in the frontend to see them.\n")
        
    except User.DoesNotExist as e:
        print(f"❌ Error: User not found - {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("GMAIL ACCOUNT TRANSFER UTILITY")
    print("="*60)
    
    # Show current situation
    print("\nCurrent Gmail accounts:")
    for acc in EmailAccount.objects.filter(provider='gmail'):
        print(f"  • {acc.email_address} → {acc.user.username}")
    
    print("\n" + "="*60)
    print("Transfer accounts from 'i@gmail.com' to another user")
    print("="*60)
    
    # Example transfer - EDIT THIS LINE
    from_user = "i@gmail.com"
    to_user = "isharafot728@gmail.com"  # CHANGE THIS to your actual username
    
    print(f"\nReady to transfer from '{from_user}' to '{to_user}'")
    print("If this is correct, uncomment the line below and run again:\n")
    print(f"# transfer_accounts('{from_user}', '{to_user}')")
    
    # Uncomment the next line to actually perform the transfer:
    # transfer_accounts(from_user, to_user)
