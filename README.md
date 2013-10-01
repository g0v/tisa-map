# Tisa-map

這個專案是為了兩岸服務貿易協定所開始的一個專案，目前這個網站會把所有會受到協定衝擊的公司列在這個 map 上，還有會讓一般民眾可以上傳抗議標語，然後把它羅列在這個 map 上面。

This project is kicked off to defend the bill of *Trade in Services Agreement* between Taiwan and Mainland China from approval.
Here we are listing cooperations influented, rolling slogans from folks, and exhibiting photos from ruins.
If you are concerning these behaviors of selling Taiwan, start to commit today. We need you.

## twcompany parser

https://github.com/ronnywang/twcompany

https://github.com/chilijung/twcompany-parser

## data

[data from dropbox](https://www.dropbox.com/sh/o8uu84oskzcsxnp/Do-TEZcra1)

http://company.g0v.ronny.tw/

data folder is from ronnywang's data https://github.com/ronnywang/twcompany , remake is after parser https://github.com/chilijung/twcompany-parser


# Develop

## Geograph

* [Leaflet](http://leafletjs.com)

* [Leaflet.GeoSearch](https://github.com/smeijer/L.GeoSearch)

* [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)

## Backend Setup

1. install ruby. version 1.9 or later of recommendation

2. `$ gem install bundler`

3. `$ bundle install`

4. `unicorn -p port` to run

## Database schema

    Column   |          Type          |                     Modifiers
    ---------+------------------------+----------------------------------------------------
    id       | integer                | not null default nextval('store_id_seq'::regclass)
    location | geometry(Point,4326)   |
    name     | character varying(128) |
    business | text                   |
    taxid    | character(8)           |
    address  | text                   |

## API

1. 以中心點和半徑搜尋 Point
    example: /lng/121.745957/lat/25.133235/radius/100

1. 以所營事業項目搜尋 Point

1. 以公司名稱搜尋 Point
    example: /name/三通報關通運有限公司

1. 以統一編號搜尋 Point
    example: /taxid/00000000

* 返回值都是 GeoJSON

### Asset Pipeline with Sass/Scss/Compass

Now we use [Sprockets](https://github.com/sstephenson/sprockets) to package and compress css and js files.
No precompilation needed. The config.ru has served all assets from `/assets` on the fly. Currently the major
css syntax variant in this project is [Scss](http://sass-lang.com/) and we are using Mixins from
[Compass](http://compass-style.org/).


License: MIT http://g0v.mit-license.org/
