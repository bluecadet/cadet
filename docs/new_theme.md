## Usage

Setup a CMS instance (such as Pantheon's [Drops 8 Composer](https://github.com/pantheon-systems/example-drops-8-composer) or [WordPress Composer](https://github.com/pantheon-systems/example-wordpress-composer)).

Once the instance is on your machine, `cd` to the root directory of the project and run `bcnew`. The process will ask for a Theme Name. Once entered, the process will:

- download BC_Base_Themes
- rename theme files and folders
- rename module/plugin files and folders
- add gulp and linting files to root

## Manual changes

You should update the projects `.gitignore` file to ignore `node_modules`. Themes from BC_Base_Themes have their own `.gitignore` files, so update as needed.
