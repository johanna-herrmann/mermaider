#!/bin/bash

###### always removing out directory after testing
trap "rm -rf out; trap INT; trap EXIT; exit 1" INT
trap "rm -rf out; trap INT; trap EXIT" EXIT

mkdir out


###### building

# all initial
echo 'prepare: building all initial'
mkdir out/init
mermaider fixtures out/init &> /dev/null

# all initial with -i
echo 'prepare: building all initial, -i set'
mkdir out/initWithI
mermaider -i fixtures out/initWithI &> /dev/null

# --all not set
echo 'prepare: --all NOT set'
mkdir out/notAll
mermaider fixtures out/notAll &> /dev/null
echo -n "modified" > out/notAll/simple.svg
mermaider fixtures out/notAll &> /dev/null

# --all set
echo 'prepare: --all IS set'
mkdir out/all
mermaider fixtures out/all &> /dev/null
echo -n "modified" > out/all/simple.svg
echo -n "modified" > out/all/subgraphs.svg
mermaider --all fixtures out/all &> /dev/null

# --update set
echo 'prepare: --update is set'
mkdir out/update
mermaider fixtures out/update &> /dev/null
echo -n "modified" > out/update/simple.svg
echo -n "modified" > out/update/subgraphs.svg
sleep 2
touch fixtures/simple.md
mermaider --update fixtures out/update &> /dev/null

# one invalid
echo 'prepare: one md file is invalid'
mkdir out/oneInvalid
cp fixtures/invalid.md.invalid out/invalid.md
cp fixtures/simple.md out/simple.md
mermaider out out/oneInvalid &> /dev/null


###### outputs

# not verbose
echo 'prepare output: not verbose'
mkdir out/tmp
mermaider --all fixtures out/tmp > out/notVerbose.out

# verbose
echo 'prepare output: verbose'
mermaider --all --verbose fixtures out/tmp > out/verbose.out

# invalid input directory
echo 'prepare output: invalid input directory'
mermaider --all --verbose invalid out/tmp 2> out/invalidIn0.err 1> out/invalidIn0.out
mermaider --all --verbose fixtures/simple.md out/tmp 2> out/invalidIn1.err 1> out/invalidIn1.out

# invalid output directory
echo 'prepare output: invalid output directory'
mermaider --all --verbose fixtures invalid 2> out/invalidOut0.err 1> out/invalidOut0.out
mermaider --all --verbose fixtures out/verbose.out 2> out/invalidOut1.err 1> out/invalidOut1.out

# missing arguments
echo 'prepare output: missing arguments'
mermaider 2> out/missingArgs0.err 1> out/missingArgs0.out
mermaider in 2> out/missingArgs1.err 1> out/missingArgs1.out

# one invalid
echo 'prepare output: one md file is invalid'
mermaider --all out out/tmp 2> out/oneInvalid.err 1> out/oneInvalid.out
mermaider --all --verbose out out/tmp 2> out/oneInvalidVerbose.err 1> out/oneInvalidVerbose.out
mermaider --all --verbose out out/tmp &> out/oneInvalidVerbose.both

# help text
echo 'prepare output: help text'
mermaider --help > out/help.out


###### doing tests
echo -e "\n\ndoing tests now\n"

export NODE_OPTIONS="--experimental-vm-modules"
npx jest --runInBand --verbose --detectOpenHandles --forceExit || exit 1


###### final report
echo -e "\n\n\nAll tests ran successfully :-)"
