# Animal Island skin

Animal Crossing–style skin for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI: cream paper, earth-brown text, mint accents, dotted wallpaper — light「Day Island」and dark「Forest Night」.

[中文](README.zh.md)

![Light home](docs/screenshots/light-home.png)
![Dark conversation](docs/screenshots/dark-conversation.png)

## Install

Requires `dsh` ≥ 0.2.2-rc.1; restart after installing.

```sh
dsh plugin --profile web add "git+https://github.com/sharkAndshark/dsh-skin-animal-island.git#d8b8e408bd60cc2f0cb39e862cb975439c5041f2&path:/skin-animal-island"
```

Or in the app: **Plugins → Discover → Add index source** →
`https://cdn.jsdelivr.net/gh/sharkAndshark/dsh-skin-animal-island@v0.1.1/market/index.json`

## Disable

Turn the row off in the Plugins page, or set `config: { enabled: false }`.

## License

Code MIT. Fonts (Nunito, ZCOOL KuaiLe) OFL 1.1 — see `skin-animal-island/assets/fonts/`.
