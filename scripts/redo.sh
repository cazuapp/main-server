#!/bin/bash

# Executes both, drop and installing of databases

sh scripts/dropall.sh
sh scripts/migrations.sh