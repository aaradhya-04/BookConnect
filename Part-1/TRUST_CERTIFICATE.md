# How to Make Your Site Show "Secure" 🔒

## Quick Fix (Automatic - If You Have Admin)

If the certificate was automatically added to Trusted Root, you're done! Just:
1. Restart your server
2. Restart your browser
3. Visit `https://localhost:3000`
4. You should see "Secure" (padlock icon) ✅

## Manual Fix (If Automatic Failed)

If you see a warning about needing Administrator privileges, follow these steps:

### Option 1: PowerShell (Recommended)

1. **Open PowerShell as Administrator:**
   - Press `Windows Key`
   - Type "PowerShell"
   - Right-click "Windows PowerShell"
   - Select "Run as Administrator"

2. **Run this command:**
   ```powershell
   Import-Certificate -FilePath "C:\Users\aarya\OneDrive\Desktop\BookConnect_Final\BookConnect\certs\localhost.cer" -CertStoreLocation Cert:\LocalMachine\Root
   ```

3. **Restart your server and browser**

### Option 2: GUI Method (Easier)

1. **Navigate to the certs folder:**
   ```
   C:\Users\aarya\OneDrive\Desktop\BookConnect_Final\BookConnect\certs\
   ```

2. **Double-click `localhost.cer`**

3. **Click "Install Certificate..."**

4. **Select "Local Machine"** (you'll need to click "Yes" on the UAC prompt)

5. **Select "Place all certificates in the following store"**

6. **Click "Browse"**

7. **Select "Trusted Root Certification Authorities"**

8. **Click "OK" → "Next" → "Finish"**

9. **Click "Yes" on the security warning**

10. **Restart your server and browser**

## Verify It Worked

After trusting the certificate:
1. Restart your Node.js server
2. Close and reopen your browser
3. Visit `https://localhost:3000`
4. You should see:
   - ✅ Padlock icon (🔒)
   - ✅ "Secure" text
   - ✅ No warnings

## Troubleshooting

**Still showing "Not Secure"?**
- Make sure you restarted both server AND browser
- Clear browser cache
- Try a different browser
- Check that you're using `https://` not `http://`

**Certificate file not found?**
- Make sure you've submitted at least one review (this generates the certificate)
- Check the `certs` folder exists

