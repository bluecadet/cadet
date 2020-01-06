```
cadet pull <init> <--exclude="*.jpg"> <--force> <-f>
```

`cadet pull`
Run pull process

`cadet pull init`
Sets up DB config

`--exclude="*.jpg"`
Excludes files from rsync. Comma seperated list, use [rsync exclude patterns](https://gist.github.com/macmladen/75817cc47f4ddf0a18f0)

`--force`, `-f`
Forces DB upload, overrices backup expiration in db config

