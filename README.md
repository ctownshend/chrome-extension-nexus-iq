# Chrome Extension for Sonatype Nexus IQ
[![DepShield Badge](https://depshield.sonatype.org/badges/ctownshend/chrome-extension-nexus-iq/depshield.svg)](https://depshield.github.io) [![CircleCI](https://circleci.com/gh/ctownshend/chrome-extension-nexus-iq.svg?style=svg)](https://circleci.com/gh/ctownshend/chrome-extension-nexus-iq)

## Table of Contents
- [Purpose](#purpose)
- [Data](#data)
- [Usage](#usage)
- [Examples](#examples)
- [Installation](#installation)

## Purpose
To allow you to inspect a package before you download it. The plugin requires a valid Sonatype Nexus Lifecycle instance. You must be licensed to use Nexus Lifecycle to use this plugin.
The plugin can scan packages at the following repositories.

1. Java - maven - https://search.maven.org/
2. Java - maven - https://mvnrepository.com/
3. JS/Node - npm - https://www.npmjs.com/
4. .Net - nuget - https://www.nuget.org/
5. Ruby - rubygems - https://rubygems.org/
6. Python - pypi - https://pypi.org/
7. php - packagist/composer/ -  https://packagist.org/
8. R - CRAN -  https://cran.r-project.org/
9. Rust - Crates-  https://crates.io/
10. Golang - Go - https://gocenter.jfrog.com/

## Data
The data is sourced from IQ Server which accesses the Sonatype Data Services for those supported ecosystems supported. Currently 1-6. Systems 7-10 get their data from Sonatype OSSIndex ( https://ossindex.sonatype.org/ ).


## Usage
1. The install will create a new icon in your Chrome Browser next to the location box.
<img src="images/Extensions_Icon_created.png" alt="drawing" width="300"/>

2. The plugin will work on any new page opened after install. It will not work on pages already opened at time of install.

3. Navigate to one of the pages that the extension is compatible with (see the list below).

4. Click on the Blue Lightbulb... 
<img src="images/Extension_lodash_-_npm_4.17.9.png" alt="drawing" width="300"/>
<br/>
4.1 ...The solution will think for a second...Then show the Data.
<img src="images/Extension_thinking_icon.png" alt="drawing" width="300"/>
<br/>
5. Component Information
<img src="images/Extension_Component_info.png" alt="drawing" width="300"/>
<br/>
6. License Information
<img src="images/Extension_Licensing.png" alt="drawing" width="300"/>
<br/>
7. Security Information
The security data is presented in a list with clickable sections for each vulnerbaility.
<img src="images/Extension_Security.png" alt="drawing" width="300"/>
<br/>



## Examples
The list of pages that are supported are here.


### Java - maven
Pattern - `https://search.maven.org/artifact/<group>/<artifact>/<version>/<extension>`
<br/>e.g. https://search.maven.org/artifact/org.apache.struts/struts2-core/2.3.30/jar
### Java - maven
Pattern -`https://mvnrepository.com/artifact/<group>/<artifact>/<version>`
<br/>e.g. https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
### JS/Node - npm
Pattern - `https://www.npmjs.com/package/<package>`
<br/>Pattern - `https://www.npmjs.com/package/<package>/v/<version>`
<br/>e.g. https://www.npmjs.com/package/lodash/v/4.17.9
### DotNet - nuget
Pattern - `https://www.nuget.org/packages/<package>/<version>`
<br/>e.g. https://www.nuget.org/packages/LibGit2Sharp/0.20.1
### Ruby - rubygems
Pattern - `https://rubygems.org/gems/<package>`
<br/>e.g. https://rubygems.org/gems/bundler
### Python - pypi
Pattern - `https://pypi.org/project/<project>/`
<br/>or Pattern - `https://pypi.org/<package>/<version>/`
<br/>e.g. https://pypi.org/project/Django/1.6/
### php - packagist/composer/
Pattern - `https://packagist.org/packages/<package>/`
<br/>e.g. https://packagist.org/packages/phpbb/phpbb#3.1.2
### R - CRAN
Pattern - `https://cran.r-project.org/`
<br/>e.g. https://cran.r-project.org/web/packages/xgboost/index.html
### Rust - Crates
Pattern - `https://crates.io/`
<br/>e.g. https://crates.io/crates/claxon/0.4.0
### Golang - Gocenter
`https://gocenter.jfrog.com`
<br/>e.g. https://gocenter.jfrog.com/github.com~2Fjbenet~2Fgo-random/versions

## Installation
1. Download the plugin from Github
`git clone https://github.com/sonatype-nexus-community/nexus-iq-chrome-extension.git`
2. Open Chrome Browser
3. Click on the three dots, then More Tools, then Extensions
<br/>
<img src="images/Extensions.png" alt="drawing" width="300"/>
<br/>
4. Click on load unpacked
<br/>
<img src="images/Extensions_Load_upacked.png" alt="drawing" width="300"/>
<br/>
5. Navigate to the folder where you downloaded the plugin from gihub onto your local machine.
<br/>
<img src="images/Extensions_Choose_Folder.png" alt="drawing" width="300"/>
<br/>
6. You will be prompted to enter your login details. (Important: Please note that this version stores your details in plain text in Chrome Storage. We are investigated secure storage but at this time we do not support it.)
<br/>
<img src="images/Extensions_Empty_login.png" alt="drawing" width="300"/>
<br/>
7. Enter your details and click save.
<br/>
<img src="images/Extensions_Login_Entered.png" alt="drawing" width="300"/>
<br/>
7. You will be advised that your details are saved, and the screen will close. You will be taken back to the Extensions Install screen in Chrome. Close the screen and begin using.
8. The installer will have created a new icon in your Chrome Menu Bar.
<br/>
<img src="images/Extensions_Icon_created.png" alt="drawing" width="300"/>
<br/>


### Uninstall
If you do not want to use the extension then you can right click on the icon and choose Remove from Chrome
<br/>
<img src="images/Extension_Disabled.png" alt="drawing" width="300"/>
<br/>





