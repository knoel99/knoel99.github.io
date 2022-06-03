
## Find all files containing a specific string

```bash
grep -Ril "text-to-find-here" /
```

Where:

* ´i´ stands for ignore case (optional in your case).
* ´R´ stands for recursive.
* ´l´ stands for "show the file name, not the result * itself".
* ´/´ stands for starting at the root of your machine.


## Recursively counting files in a Linux directory

```bash
find . -type f | wc -l
```

Where:

* -type f to include only files.
* | (and not ¦) redirects find command's standard output to wc command's standard input.
* wc (short for word count) counts newlines, words and bytes on its input (docs).
* -l to count just newlines.

### If you want a breakdown of how many files are in each dir under your current dir:

```bash
for i in */ .*/ ; do 
    echo -n $i": " ; 
    (find "$i" -type f | wc -l) ; 
done
```


