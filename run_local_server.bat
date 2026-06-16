@echo off
echo ===================================================
echo [Smart Portal Local Server Launcher (PowerShell)]
echo ===================================================
echo.
echo Launching local server on http://localhost:8080
echo (No Python or Node.js required!)
echo.
echo To stop the server, just close this window.
echo ---------------------------------------------------

powershell -NoProfile -ExecutionPolicy Bypass -Command "& { $port = 8080; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:' + $port + '/'); try { $listener.Start(); Write-Host 'Server successfully started at http://localhost:8080/'; Start-Process 'http://localhost:8080/'; while ($listener.IsListening) { $context = $listener.GetContext(); $req = $context.Request; $res = $context.Response; $urlPath = $req.Url.LocalPath.TrimStart('/'); if ($urlPath -eq '') { $urlPath = 'index.html' }; $filePath = Join-Path (Get-Location) $urlPath; if (Test-Path $filePath -PathType Leaf) { $bytes = [System.IO.File]::ReadAllBytes($filePath); $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); $ct = 'text/plain'; if ($ext -eq '.html') { $ct = 'text/html; charset=utf-8' } elseif ($ext -eq '.css') { $ct = 'text/css; charset=utf-8' } elseif ($ext -eq '.js') { $ct = 'text/javascript; charset=utf-8' } elseif ($ext -eq '.png') { $ct = 'image/png' } elseif ($ext -eq '.jpg' -or $ext -eq '.jpeg') { $ct = 'image/jpeg' }; $res.ContentType = $ct; $res.ContentLength64 = $bytes.Length; $res.OutputStream.Write($bytes, 0, $bytes.Length) } else { $res.StatusCode = 404 }; $res.Close() } } finally { $listener.Stop() } }"
pause
