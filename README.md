<h1 align="center">
<span align="left" height="30">                  </span>
Shorten My Links
<a href="https://www.buymeacoffee.com/stdword">
  <img align="right" src="https://github.com/stdword/logseq13-shorten-my-links/blob/main/assets/coffee.png?raw=true" height="30px"/>
</a>
</h1>

<p align="center">
  <a href="https://github.com/stdword/logseq13-shorten-my-links#readme">
    <img align="center" width="15%" src="https://github.com/stdword/logseq13-shorten-my-links/blob/main/icon.png?raw=true"/>
  </a>
</p>

<p align="center"><i>A part of the <a href="https://logseq.com"><img align="center" width="20px" src="https://github.com/stdword/logseq13-shorten-my-links/blob/main/assets/logseq.png?raw=true"/></a> <b>Logseq13</b> family of plugins</i></p>

<div align="center">

[![Version](https://img.shields.io/github/v/release/stdword/logseq13-shorten-my-links?color=5895C9)](https://github.com/stdword/logseq13-shorten-my-links/releases)
[![Downloads](https://img.shields.io/github/downloads/stdword/logseq13-shorten-my-links/total.svg?color=D25584)](https://github.com/stdword/logseq13-shorten-my-links#from-logseq-marketplace-recommended-way)

</div>

This is the plugin for [Logseq](https://logseq.com) and it shorts your links :)

Well, it is better to say it shorts your **references**, not all links. References to Logseq pages of course. And it shorts only **hierarchical** references. And... only **redundant** hierarchical references: which **duplicates** the page name.

Why? To <u>reduce visual efforts</u> while viewing the page.

Let's see the demo:

<img width="350px" src="https://github.com/stdword/logseq13-shorten-my-links/assets/1984175/a855f45b-f6a7-4866-a465-e191fb773b5d"/>

These references have the **same prefix as the *current* page title**, so it has been truncated.

And the more practical one:

<img width="650px" src="https://github.com/stdword/logseq13-shorten-my-links/assets/1984175/0c5c11a6-8a8f-4d1d-9c47-1a1da3e8c3e6"/>

These references have the **same prefix as the *embedded* page title**, so it has been truncated.
Embedded page header truncated in comparison with current page title.

## If you ❤️ what I'm doing — consider to support my work
<p align="left">
  <a href="https://www.buymeacoffee.com/stdword" target="_blank">
    <img src="https://github.com/stdword/logseq13-shorten-my-links/blob/main/assets/coffee.png?raw=true" alt="Buy Me A Coffee" height="60px" />
  </a>
</p>

## Installation
### From Logseq Marketplace (recommended way):
<span>    </span><img width="412" alt="marketplace" src="https://github.com/stdword/logseq13-shorten-my-links/assets/1984175/d66bf172-b958-44ed-a386-92b4aec0d10d" />

- In Logseq: click «...» at the top of the page and open the «Plugins» section (or press `t p`)
- Click on the «Marketplace»
- On the «Plugins» tab search for «Shorten My Links» plugin and click install
- There is no settings or any setup steps: the plugin is completely automatic — just start making references

### Manual way (in case of any troubles with recommended way)
1. *In Logseq*: Enable «Developer mode» in «...» → Settings → Advanced
2. Download the <u>latest</u> plugin release in a raw .zip archive from [here](https://github.com/stdword/logseq13-shorten-my-links/releases)
   
   <img width="250px" src="https://github.com/stdword/logseq13-shorten-my-links/assets/1984175/d0e48456-a1e3-4367-8e63-d143c6ada030"/>
4. Unzip it
5. *In Logseq*: Go to the «...» → Plugins, click «Load unpacked plugin» and point to the unzipped plugin folder

   <img width="600px" src="https://github.com/stdword/logseq13-shorten-my-links/assets/1984175/4b97b0f7-0364-423a-bfe5-8566863e0294"/>
6. ⚠️ The important point here is: every new plugin release should be updated manually

## FAQ
### Plugin doesn't work. How to fix? Reinstall the plugin manually:
1. In Logseq: Open the plugins page (press `t p`)
2. In Logseq: Open plugin **text** settings

   <img width="400px" src="https://github.com/stdword/logseq13-shorten-my-links/assets/1984175/5503c3aa-d197-435d-bb18-a5f5c26e2ff8"/>

3. In text editor: Change disabled state from *«false»* to *«true»* and save

   <img width="400px" src="https://github.com/stdword/logseq13-shorten-my-links/assets/1984175/cd0bf6af-ccde-48ab-8bd8-cbcc02dda2f3"/>

4. Restart Logseq
5. In Logseq: Open plugins page again (`t p`)
6. Uninstall the plugin
7. Install the plugin again from Marketplace

## Integrated with plugins:
- [Awesome Links](https://github.com/yoyurec/logseq-awesome-links)
- [Page-tags and Hierarchy](https://github.com/YU000jp/logseq-page-tags-and-hierarchy)

## Credits
- [Logseq Namespace Abbreviator script](https://github.com/Bad3r/logseq-scripts/blob/main/LogseqNamespaceAbbreviator.js) by Bad3r
- [Page icon abbreviations script](https://gist.github.com/ThinkSalat/b1548d31e87384f960289142223f9853) by ThinkSalat
- Namespace prefixes collapser script from [Logseq Custom Files](https://github.com/cannibalox/logseq-custom-files) by cannibalox
- Icon created by <a href="https://www.flaticon.com/free-icon/link_3093852" title="Flaticon">Freepik</a>

## License
[MIT License](https://github.com/stdword/logseq13-shorten-my-links/blob/main/LICENSE)
