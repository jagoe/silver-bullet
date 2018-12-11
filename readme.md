# Silver Bullet

a projectile booking tool

## Installation

`$ git clone git@github.com:jagoe/silver-bullet.git`

`$ cd silver-bullet && yarn install`

create `.silverbullet.json` in \$HOME and add some basic configurations

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
      }
    }
  },
  "jira": {
    "restUri": "https://YOUR_JIRA_URL/rest",
    "credentials": {
      "basic": {
        "username": "USERNAME",
        "password": "PASSWORD"
      }
    },
    "ticketPatterns": ["JIRA_KEY-\\d+"]
  }
}
```

## Project-Mappings

`projectNr` is the projectile project number  
`packageNr` is the projectile packate number  
`comment` is the default comment

```json
{
  "mappings": {
    "Zeiterfassung": {
      "projectNr": 2759,
      "packageNr": 595,
      "comment": "Zeiterfassung"
    },
    "Mein Projekt": {
      "projectNr": 12345,
      "packageNr": 123
    }
  }
}
```

## Ticketpaterns

with _ticket patterns_ you can import data from Jira tasks

`"JIRA_KEY-\\d+"`

## time tracking

- create a time.txt file in \$HOME

Syntax:

```
BLOCK
STARTTIME - ENDTIME MAPPING_KEY: COMMENT
STARTTIME - ENDTIME MAPPING_KEY: COMMENT
STARTTIME - ENDTIME MAPPING_KEY: COMMENT
STARTTIME - ENDTIME MAPPING_KEY: COMMENT
```

Example

```
Mo/10.12.
08:45 - 09:15 Zeiterfassung
09:15 - 09:45 Company Update
09:45 - 10:15 Mein Projekt: JIRA_KEY-12345
10:15 - 11:15 Teammeeting
11:15 - 14:00 Mein Projekt: Refactoring
14:00 - 15:30 Mein Projekt: Support Teammitglieder
15:30 - 16:45 WirUm4
Di/11.12.
08:45 - 09:15  Mein Projekt: Tickets aufräumen

```

## default config

Copy the config in your \$HOME directory

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
      }
    }
  },
  "jira": {
    "restUri": "https://YOUR_JIRA_URL/rest",
    "credentials": {
      "basic": {
        "username": "USERNAME",
        "password": "PASSWORD"
      }
    },
    "ticketPatterns": ["JIRA_KEY-\\d+"]
  },
  "mappings": {
    "Zeiterfassung": {
      "projectNr": 2759,
      "packageNr": 595,
      "comment": "Zeiterfassung"
    },
    "Meeting": {
      "projectNr": 2759,
      "packageNr": 594
    },
    "Company Update": {
      "projectNr": 2759,
      "packageNr": 594,
      "comment": "Weekly Company Update"
    },
    "Teammeeting": {
      "projectNr": 2759,
      "packageNr": 594,
      "comment": "Teammeeting"
    },
    "Feiern": {
      "projectNr": 2759,
      "packageNr": 596
    },
    "Lagerfeuer": {
      "projectNr": 2759,
      "packageNr": 596,
      "comment": "Lagerfeuer"
    },
    "Frühstück": {
      "projectNr": 2759,
      "packageNr": 596,
      "comment": "Frühstück"
    },
    "WirUm4": {
      "projectNr": 2760,
      "packageNr": 175,
      "comment": "WirUm4"
    },
    "Friday@5": {
      "projectNr": 2760,
      "packageNr": 175,
      "comment": "Friday@5"
    }
  }
}
```
