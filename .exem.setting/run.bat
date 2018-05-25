@echo off
cd /d "%~d0%~p0"
rem =============================================

xcopy /I /Y /E     settings   ..\.settings

copy /Y gitignore ..\.gitignore
copy /Y project   ..\.project
