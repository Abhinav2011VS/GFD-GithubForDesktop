@echo off

rem Define the installation directory of your app
set INSTALL_DIR=C:\Program Files\GFD

rem Remove the application files
rmdir /s /q %INSTALL_DIR%

echo Uninstallation complete.
