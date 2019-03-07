# Silver Bullet

A projectile booking tool

* [Silver Bullet](#silver-bullet)
  * [Installation](#installation)
  * [Configuration](#configuration)
    * [Explanation](#explanation)
  * [Time Tracking](#time-tracking)
    * [Syntax](#syntax)
    * [Example](#example)
  * [Usage](#usage)

## Installation

1. `git clone git@github.com:jagoe/silver-bullet.git`
2. `cd silver-bullet && yarn install`
3. Adjust the `deploy` NPM script if you prefer a different location
4. `yarn deploy`
5. [Configure](#configuration)

## Configuration

1. Create `.silverbullet.json` in `$HOME` and add some basic configurations

```json
{
  "editor": "code -r",
  "path": "~/time.txt",
  "projectile": {
    "api": {
      "host": "http://localhost",
      "port": 7466
    },
    "credentials": {
      "basic": {
        "username": "USERNAME",
        "password": "PASSWORD"
      },
      "pass": {
        "name": "Domain",
        "usernameLine": 2,
        "passwordLine": 1
      }
    }
  },
  "jira": {
    "restUri": "https://YOUR_JIRA_URL/rest",
    "credentials": {
      "basic": {
        "username": "USERNAME",
        "password": "PASSWORD"
      },
      "pass": {
        "name": "JIRA",
        "usernameLine": 2,
        "passwordLine": 1
      }
    },
    "ticketPatterns": ["JIRA_KEY-\\d+"]
  },
  "mappings": {
    "Mein Projekt": {
      "projectNr": 12345,
      "packageNr": 123
    },
    "Zeiterfassung": {
    "projectNr": 2759,
    "packageNr": 595,
    "comment": "Zeiterfassung"
    }
  }
}
```

### Explanation

* `editor`: The editor used to open tracking, preview and to edit the config with
* `path`: Path of the time tracking file
* `projectile`: Connection information for the Projectile API
  * `api`: Location of an instance of the 7val Projectile API
  * `credentials`: Projectile [credentials](#credentials) (only one is necessary)
* `jira`: Configuration used for JIRA ticket information extraction
  * `restUri`: URI of the JIRA REST API
  * `credentials`: JIRA [credentials](#credentials) (only one is necessary)
  * `ticketPatterns`: A list of regular expressions that identify ticket numbers in time tracking comments;
                      used to import summaries of JIRA tasks and stories
* `mappings`: [Project mappings](#project-mappings)

#### Credentials

* `basic`: Plain-text credentials
  * `username`: User name
  * `password`: Password
* `pass`: Credential information for the [pass](https://www.passwordstore.org/) password manager
  * `name`: Password location
  * `usernameLine`: Line the user name is stored in
  * `passwordLine`: Line the password is stored in

#### Project Mappings

* `projectNr`: The projectile project number
* `packageNr`: The projectile packate number
* `comment`: _(optional)_ The default comment

## Time Tracking

Create `time.txt` in `$HOME` (or whatever file path you specified in the configuration file).

### Syntax

```plain
BLOCK
STARTTIME - ENDTIME MAPPING_KEY: COMMENT
STARTTIME - ENDTIME MAPPING_KEY: COMMENT
STARTTIME - ENDTIME MAPPING_KEY: COMMENT
STARTTIME - ENDTIME MAPPING_KEY: COMMENT
```

### Example

Note that only the date is important to start a new block; anything before and including the `/` (`Mo/`, `Monday/`, ...)
is completely optional and will not be used.

```plain
Mo/10.12.
08:45 - 09:15 Zeiterfassung
09:15 - 09:45 Company Update
09:45 - 10:15 Mein Projekt: JIRA_KEY-12345
10:15 - 11:15 Teammeeting
11:15 - 14:00 Mein Projekt: Refactoring
14:00 - 15:30 Mein Projekt: Support Teammitglieder
15:30 - 16:45 WirUm4

Thu/11.12.
08:45 - 09:15  Mein Projekt: Tickets aufräumen

12.12.
08:00 - 16:00 Mein Projekt: JIRA_KEY-12345

```

## Usage

The `silverbullet` script can be found in `./bin` or, after deployment, in `$HOME/bin/_silverbullet`. Feel free to set
up an alias pointing to `$HOME/bin/_silverbullet/bin/silverbullet`.\
Run `silverbullet -h` or take a look at the following to learn about how to use the tool.

---

`silverbullet [options]`\
Without options the time tracking file will be opened for editing.

Options:

* `-c`, `--config`: Path to the config file. [~/.silverbullet.json]
* `-e`, `--edit`: Open the config file in the editor specified in the config file.
* `-p`, `--preview`: Add this flag to show a preview of the time data next to the input file instead of submitting.
                     Optionally supply the output file path, which defaults to adding `_parsed` to the tracking file
                     name.
* `-x`, `--export`:  Add this flag to export all tracked data to Projectile using the configuration.
* `-l`, `--latest`:  Add this flag to export or preview the latest entry only.
* `-h`, `--help`:    Print this list and exit.
