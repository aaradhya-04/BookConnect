# HTTPS Certificate Generation with PowerShell

## ✅ What's Changed

The certificate generator now uses **PowerShell** instead of OpenSSL, which means:
- ✅ **No OpenSSL installation required** - Uses built-in Windows PowerShell
- ✅ **Automatic generation** - Works when you submit your first review
- ✅ **No manual steps needed** - Everything happens automatically

## 🚀 How It Works

1. **Automatic Trigger**: When you submit your **first review**, the system will automatically:
   - Generate a self-signed SSL certificate using PowerShell
   - Save it to `BookConnect/certs/key.pem` and `cert.pem`
   - The server will automatically use HTTPS on the next restart

2. **No Action Required**: You don't need to do anything! Just:
   - Start your app normally
   - Submit your first review
   - The certificate will be generated automatically
   - Restart the server (if needed) to use HTTPS

## 📋 What You Need to Know

### Requirements:
- ✅ **Windows OS** (PowerShell is built-in)
- ✅ **PowerShell 5.1 or later** (comes with Windows 10/11)
- ✅ **Administrator privileges** (may be required for certificate generation)

### If You Get Permission Errors:

If PowerShell execution policy blocks the script, you can manually allow it:

```powershell
# Open PowerShell as Administrator and run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Note**: The code already uses `-ExecutionPolicy Bypass` flag, so this should not be necessary.

## 🔍 Manual Testing (Optional)

If you want to test certificate generation manually:

1. **Delete existing certificates** (if any):
   ```powershell
   Remove-Item BookConnect\certs\key.pem -ErrorAction SilentlyContinue
   Remove-Item BookConnect\certs\cert.pem -ErrorAction SilentlyContinue
   ```

2. **Submit a review** - The certificate will be generated automatically

3. **Check the certs folder**:
   ```powershell
   dir BookConnect\certs
   ```
   You should see `key.pem` and `cert.pem`

4. **Restart your server** - It will now use HTTPS

## 🎯 Summary

**You don't need to do anything!** The certificate generation is now fully automatic using PowerShell. Just:
1. Run your app
2. Submit your first review
3. Certificate will be generated automatically
4. Restart server to use HTTPS

That's it! 🎉

