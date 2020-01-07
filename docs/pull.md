```
cadet pull --init --rebuild --exclude="*.jpg"> <--force> <-f>
```

`cadet pull`
Run pull process

`--init`
Sets up DB config

`--init`
Runs DB Config questions, if config file does not exist

`--rebuild`
Deletes DB Config file and re-asks DB Config questions

`--exclude="*.jpg"`
Excludes files from rsync. Comma seperated list, use [rsync exclude patterns](https://gist.github.com/macmladen/75817cc47f4ddf0a18f0)

`--force`, `-f`
Forces DB upload, overrices backup expiration in db config

