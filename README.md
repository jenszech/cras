# cras
Conference room assisting system

Dieses Projekt stellt einen Node.js Server bereit der alle Daten für ein Konferenzraum Anzeigesystem verwaltet

## Features

* tbd. 
    
Für geplante Features und Änderungen siehe [CHANGELOG.md](CHANGELOG.md)
     
## Getting Started

Diese Anleitung zeigt anhand einer Beispiel Installation auf dem Raspberry wie die der StatusMonitor installiert, eingerichtet und betrieben werden kann.

### Prerequisites

* Raspberry Pi 3 - Im folgenden Beispiel wird die Einrichtung an Hand eines Raspberry PI 3 mit bereits installiertem Rasbian beschrieben.
* git
* node.js

#### Raspberry
Basis ist eine Standard Rasbian Stretch Lite installation
* Download Rasbian: https://cras.raspberrypi.org/downloads/raspbian/

Nach der Ersteinrichtung folgt die Anpassung:

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install vim
sudo apt-get install nano
```

#### Installation von git
```
sudo apt-get update
sudo apt-get install git
```

#### Installation von node.js
```
sudo apt-get update
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

### Installation
#### Installation des CRAS Projekts
```
git clone https://github.com/jenszech/cras.git
cd cras
npm install
```
#### Einrichten als Hintergrundprocess
Einrichten als Process mit Autostart
```
sudo npm install pm2@latest -g
pm2 start bin/cras
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
pm2 list
```

#### Einrichten einer Umgebungsvariable
Um unterschiedliche Konfigurationen je Umgebung (Dev, Integ, Prod) nutzen zu können, muss auf dem System die aktuelle Umgebung gesetzt werden.
Dafür muss in der environment Konfiguration 
``` 
sudo vi /etc/environment 
```
die folgende Zeile hinzuggefügt werden
```
NODE_ENV=prod
```

#### Test ####
Wenn alles erfolgreich war ist http://<YOUR IP>:3000 das WebInterface erreichbar.

### Konfiguration
Die Konfiguration erfolgt über eine Zentrale Konfigurationsdatei (default.json).
Sie kann durch lokale Enviroment Konfigurationen (.z.B. prod.json oder dev.json) überschrieben werden.
Dabei werden alle nicht überschriebenen Elemente aus der default.json vererbt. Die Lokale Datei muss dabei genauso heißen wie die in der Environment gesetzte Name (NODE_ENV=prod)

In der Default Konfiguration sollten keine Username, Passwörter oder lokalen Server eingetragen werden. Es sollten nur allgemeingültige Werte enthalten sein.
Die Environment Konfiguration enthalten dagegen alle lokalen Anpassungen inkl. Passwörter. Sie sollten daher nichts ins Github eingecheckt werden.

#### Default.json
```json
{
  "CRAS": {
    "mainSetting": {
 
    }
  }
}
```

#### prod.json Example
```json
{
  
}
```

### Betrieb
Das WebInterface: http://<YOUR IP>:3000
Konfigurationsdateien liegen unter: ~/cras/conf/
Logdateien liegen unter: ~/cras/logs/

#### Server Status abfragen
```
pm2 list
```

#### Server neustarten
```
pm2 restart cras
```

#### Update der Projekt Software
```
cd cras
git pull
pm2 restart cras
```


## Built With

* [Node.js](https://nodejs.org)
* [PM2 Guideline](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04) für NodeJS Application auf Produktions Servern 

## Contributing

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Jens Zech** - *Initial work* - [jzech](https://github.com/jzech)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


