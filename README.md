# Tisa-map

這個專案是為了兩岸服務貿易協定所開始的一個專案，目前這個網站會把所有會受到協定衝擊的公司列在這個 map 上，還有會讓一般民眾可以上傳抗議標語，然後把它羅列在這個 map 上面。



# Tech 

## L.Geocoder

origin from [https://github.com/smeijer/L.GeoSearch](https://github.com/smeijer/L.GeoSearch)


## twcompany parser

https://github.com/ronnywang/twcompany

https://github.com/chilijung/twcompany-parser

## data

[data from dropbox](https://www.dropbox.com/sh/o8uu84oskzcsxnp/Do-TEZcra1)

http://company.g0v.ronny.tw/

data folder is from ronnywang's data https://github.com/ronnywang/twcompany , remake is after parser https://github.com/chilijung/twcompany-parser


# Develop

現在要改動 html 請更動 index.jade 然後把 jade render 回 html。
`-w` 用來 watch 檔案他會自動的 render 出 html 如果他有更動的話。

```
jade -w index.jade
```


