@echo off
title Productivity Dashboard Launcher
echo Starting Productivity Dashboard...

start "Dashboard Backend" cmd /k "cd server && npm start"
start "Dashboard Frontend" cmd /k "cd client && npm run dev"

timeout /t 3 >nul
start http://localhost:5173

echo Dashboard is running!
