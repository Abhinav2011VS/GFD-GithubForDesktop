const { app, BrowserWindow, Notification, nativeTheme } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

let mainWindow;
let introWindow;

function getFavicon() {
    const isDarkMode = nativeTheme.shouldUseDarkColors;
    return isDarkMode ? 'favicon-dark.png' : 'favicon-light.png';
}

function createIntroWindow() {
    introWindow = new BrowserWindow({
        width: 400,
        height: 200,
        icon: path.join(__dirname, getFavicon()),
        resizable: false,
        title: 'Github For Desktop',
        autoHideMenuBar: true,
        center: true,
        frame: false,
        alwaysOnTop: true,
        backgroundColor: '#fff'
    });

    introWindow.loadFile('intro.html');

    introWindow.once('ready-to-show', () => {
        introWindow.show();

        // Close the intro window after 5 seconds
        setTimeout(() => {
            introWindow.close();
            createMainWindow();
        }, 5000);
    });
}

function createMainWindow() {
    // Retrieve the window state if the file exists, otherwise set default values
    let windowState;
    const windowStatePath = path.join(app.getPath('userData'), 'windowState.json');
    try {
        windowState = JSON.parse(fs.readFileSync(windowStatePath));
    } catch (error) {
        windowState = {
            width: 800,
            height: 600,
            x: undefined,
            y: undefined,
            maximized: false,
            minimized: false
        };
    }

    // Create the browser window with the retrieved window state
    mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        icon: path.join(__dirname, getFavicon()), // Set the favicon based on system appearance mode
        autoHideMenuBar: true,
        show: false // Don't show the window until it's ready to prevent flickering
    });

    // Load the GitHub website
    mainWindow.loadURL('https://github.com');

    // Maximize or minimize the window based on the previous state
    if (windowState.maximized) {
        mainWindow.maximize();
    } else if (windowState.minimized) {
        mainWindow.minimize();
    }

    // Show the window when it's ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Save window state when the window is about to close
    mainWindow.on('close', () => {
        const currentState = mainWindow.getBounds();
        currentState.maximized = mainWindow.isMaximized();
        currentState.minimized = mainWindow.isMinimized();
        fs.writeFileSync(windowStatePath, JSON.stringify(currentState));
    });

    // Dereference the window object when closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open links externally
    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        require('electron').shell.openExternal(url);
    });
}

app.whenReady().then(createIntroWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        createIntroWindow();
    }
});

// Configure auto-updater
autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'https://abhinav2011vs.github.io/App-Universe/apps/blitzauto/updates/latest.yml'
});

// Check for updates when app is ready
app.on('ready', function () {
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
        console.error('Error checking for updates:', err.message);
    });
});

// Listen for update events
autoUpdater.on('update-available', function () {
    const notification = new Notification({
        title: 'Update Available',
        body: 'A new version of the application is available. Click here to download.',
        silent: true
    });

    notification.show();

    notification.on('click', () => {
        autoUpdater.downloadUpdate();
    });
});

autoUpdater.on('update-downloaded', function () {
    const notification = new Notification({
        title: 'Update Downloaded',
        body: 'The update has been downloaded. Restart the application to apply the updates.',
        silent: true
    });

    notification.show();

    notification.on('click', () => {
        autoUpdater.quitAndInstall();
    });
});
