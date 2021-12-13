<!-- insert
---
title: "Lightweight Container Proxy"
date: 2021-08-23T20:13:46Z
description: "🔒 Lightweight firefox addon providing socks5 proxy per container"
tags:
- Firefox
- SOCKS
- Proxy
---
{{< rawhtml >}}
<div align=center class="badges center">
{{< /rawhtml >}}
end_insert -->

<!-- remove -->
<div align=center>
<!-- end_remove -->

![logo](https://raw.githubusercontent.com/cljoly/lightweight-container-proxy/master/logo.svg)

<!-- remove -->
# Lightweight Container Proxy
<!-- end_remove -->

[![Mozilla Add-on](https://img.shields.io/amo/v/lightweight-container-proxy-02?color=blueviolet&label=Get%20it%20now%21&logo=firefox&style=for-the-badge)](https://addons.mozilla.org/en-US/firefox/addon/lightweight-container-proxy-02/?utm_source=github.com&utm_medium=shield)

<!-- insert
{{< rawhtml >}}
end_insert -->
</div>
<!-- insert
{{< /rawhtml >}}
end_insert -->

<!-- insert
{{< github_badge >}}
end_insert -->

*******************************************
> **Since [version 8.0.0](https://github.com/mozilla/multi-account-containers/releases/tag/8.0.0), [Firefox Multi-Account Containers](https://addons.mozilla.org/en-GB/firefox/addon/multi-account-containers/) supports per-container proxy. As a result, this extension is almost entirely redundant and I’m not developing it anymore.**
*******************************************

This firefox addon will, for each [tab container](https://addons.mozilla.org/en-GB/firefox/addon/multi-account-containers/) optionally redirect traffic through a socks5 proxy.

The aim is to keep the code small to ease inspection ([malware in extensions](https://lwn.net/Articles/846272/) do happen). Have a look at the code yourself!

![Settings page](https://raw.githubusercontent.com/cljoly/lightweight-container-proxy/master/img/screenshot.png)

## Permission Request Explanations

- `Access your data for all websites` is required to proxy every request based on the container they originate from.
- `Control browser proxy settings` is required to set proxy  settings on the fly for each request.

## Acknowledgements

- [github.com/jonathanKingston/containers-https](https://github.com/jonathanKingston/containers-https), used as a starting point
- [Vector clip art of four crossed color feathers](https://publicdomainvectors.org/en/free-clipart/Vector-clip-art-of-four-crossed-color-feathers/31643.html) (public domain), as a base for the logo
