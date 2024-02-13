#!/bin/bash

# Drops all tables

npx sequelize-cli db:migrate:undo:all
