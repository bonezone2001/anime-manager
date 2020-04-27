// TODO: Require this file from application data folder to allow user to customize themes
// FURTHERMORE: Dynamically generate theme buttons for each theme (allowing user to add more themes)

// TODO: Add more options for each theme (hover color, sidebar, etc.)

module.exports = class Colors {
    static dark() {
        return {
            background: "#151515",
            text: "#fff",
        }
    }

    static light() {
        return {
            background: "#F8F8FF",
            text: "#000"
        }
    }

    static getTheme(theme) {
        if(theme == "dark")
            return this.dark();
        if(theme == "light")
            return this.light();
        return this.dark();
    }
}