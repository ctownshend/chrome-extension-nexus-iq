# chrome-extension-nexus-iq
Sonatype Nexus IQ Server scan of a component from a chrome extension

[![DepShield Badge](https://depshield.sonatype.org/badges/ctownshend/chrome-extension-nexus-iq/depshield.svg)](https://depshield.github.io)

[![CircleCI](https://circleci.com/gh/ctownshend/chrome-extension-nexus-iq.svg?style=svg)](https://circleci.com/gh/ctownshend/chrome-extension-nexus-iq)

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