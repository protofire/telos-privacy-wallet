# ============================================================
# zkTelos Relayer Balance Monitor
# Checks TLOS balance of both relayers every 6 hours.
# Sends an email alert if either drops below the threshold.
# ============================================================
#
# SETUP (one-time):
#   1. Enable 2-Step Verification on your Google account
#   2. Go to https://myaccount.google.com/apppasswords
#   3. Generate an App Password for "Mail"
#   4. Set the following environment variables before running:
#        $env:GMAIL_FROM        = "your-sender@gmail.com"
#        $env:GMAIL_TO          = "your-recipient@example.com"
#        $env:GMAIL_APP_PASSWORD = "your-app-password"
#
# SCHEDULE (run once in an elevated PowerShell to register):
#   $scriptPath = "C:\Users\jpkap\Desktop\Claude\Telos zkWallet\scripts\check-relayer-balance.ps1"
#   $action  = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NonInteractive -ExecutionPolicy Bypass -File `"$scriptPath`""
#   $trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Hours 6) -Once -At (Get-Date)
#   Register-ScheduledTask -TaskName "zkTelos Relayer Monitor" -Action $action -Trigger $trigger -RunLevel Highest -Force
# ============================================================

# ---- CONFIG ------------------------------------------------
$TelosRpc        = "https://telos.drpc.org"
$ThresholdTlos   = 150

$Relayers = @(
    @{ Name = "TLOS Pool";   Address = "0xD44270dC0e25C7F2187901A912B7D2E25A6E781a"; Explorer = "https://www.teloscan.io/address/0xD44270dC0e25C7F2187901A912B7D2E25A6E781a" },
    @{ Name = "USDC.e Pool"; Address = "0x0b7c4c35fe2a7623896CE3560554698F8b5fe609"; Explorer = "https://www.teloscan.io/address/0x0b7c4c35fe2a7623896CE3560554698F8b5fe609" }
)

$GmailFrom        = $env:GMAIL_FROM
$GmailTo          = $env:GMAIL_TO
$GmailAppPassword = $env:GMAIL_APP_PASSWORD
# ---- END CONFIG --------------------------------------------

function Get-TelosBalance($address) {
    $body = @{
        jsonrpc = "2.0"
        method  = "eth_getBalance"
        params  = @($address, "latest")
        id      = 1
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $TelosRpc -Method Post `
        -ContentType "application/json" -Body $body -TimeoutSec 15

    # Convert hex wei -> TLOS
    $weiHex = $response.result -replace "^0x", ""
    $wei    = [System.Numerics.BigInteger]::Parse("0" + $weiHex, "AllowHexSpecifier")
    $tlos   = [double]$wei / 1e18
    return [math]::Round($tlos, 4)
}

# ---- Check balances ----------------------------------------
$alerts  = @()
$summary = @()

foreach ($r in $Relayers) {
    try {
        $balance = Get-TelosBalance $r.Address
        $status  = if ($balance -lt $ThresholdTlos) { "⚠️  LOW" } else { "✅ OK" }
        Write-Host "$status  $($r.Name): $balance TLOS  ($($r.Address))"
        $summary += "$status  $($r.Name): $balance TLOS"

        if ($balance -lt $ThresholdTlos) {
            $alerts += $r + @{ Balance = $balance }
        }
    } catch {
        Write-Host "ERROR querying $($r.Name): $_"
        $summary += "❌ ERROR  $($r.Name): could not fetch balance"
    }
}

# ---- Send email if needed ----------------------------------
if ($alerts.Count -gt 0) {
    $subject = "⚠️ zkTelos Relayer Low Balance Alert"

    $bodyLines = @("One or more zkTelos relayers are running low on TLOS.", "")
    foreach ($a in $alerts) {
        $bodyLines += "  • $($a.Name): $($a.Balance) TLOS  (threshold: $ThresholdTlos TLOS)"
        $bodyLines += "    Teloscan: $($a.Explorer)"
        $bodyLines += ""
    }
    $bodyLines += "Please top up the relayer wallet(s) to ensure deposits and withdrawals keep working."
    $bodyLines += ""
    $bodyLines += "-- zkTelos Relayer Monitor"
    $emailBody = $bodyLines -join "`r`n"

    try {
        $smtp   = New-Object System.Net.Mail.SmtpClient("smtp.gmail.com", 587)
        $smtp.EnableSsl            = $true
        $smtp.Credentials          = New-Object System.Net.NetworkCredential($GmailFrom, $GmailAppPassword)

        $mail           = New-Object System.Net.Mail.MailMessage
        $mail.From      = $GmailFrom
        $mail.To.Add($GmailTo)
        $mail.Subject   = $subject
        $mail.Body      = $emailBody

        $smtp.Send($mail)
        Write-Host "Alert email sent to $GmailTo"
    } catch {
        Write-Host "Failed to send email: $_"
    }
} else {
    Write-Host "All relayers OK — no alert needed."
}
