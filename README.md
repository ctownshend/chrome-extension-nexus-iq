# chrome-extension-nexus-iq
Sonatype Nexus IQ Server scan of a component from a chrome extension

[![DepShield Badge](https://depshield.sonatype.org/badges/ctownshend/chrome-extension-nexus-iq/depshield.svg)](https://depshield.github.io)

[![CircleCI](https://circleci.com/gh/ctownshend/chrome-extension-nexus-iq.svg?style=svg)](https://circleci.com/gh/ctownshend/chrome-extension-nexus-iq)


# Version 1.7.3-All URLS
* Supports running IQ server on any URL
* Fixed various bugs

# Version 1.7.2-added new formats
* added new formats
* Fixed various bugs
* Added unit tests

## Formats/package manager pages supported as of 1.7.2
* Java - maven - https://search.maven.org/
* Java - maven - https://mvnrepository.com/
* JS/Node - npm - https://www.npmjs.com/
* .Net - nuget - https://www.nuget.org/
* Ruby - rubygems - https://rubygems.org/
* Python - pypi - https://pypi.org/
* php - packagist/composer/ -  https://packagist.org/
* R - CRAN -  https://cran.r-project.org/
* Rust - Crates-  https://crates.io/
* Golang - Go - https://gocenter.jfrog.com/

# Version 1.7.1 - Fixed popup
* Fixed popup logic bug. 
* Began adding testing


# Version 1.7 - initial release
Complete rewrite to fix cookie problem with calling Nexus IQ server.
I have decided the best way to fix the security issues for now is to limit access to http://iq-server:8070. 
So you will have to alias your localhost as iq-server in your /etc/hosts/ file to use this plugin for now.
I will think about a change which gives access to all URLS like so below

Add "*://*/*" to permissions section like so

`"permissions": [
    "*://*/*",
 `   
    
This would then mean you would not need to alias Nexus IQ.

Supports scanning components in the following repos
* https://search.maven.org/
* https://mvnrepository.com/
* https://www.npmjs.com/
* https://www.nuget.org/
* https://rubygems.org/
* https://pypi.org/
* https://packagist.org/