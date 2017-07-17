#!/usr/bin/env bash

# Wait for database ready to handle connections
wait-for-it db:5432 -- \
    composer run migrate migrate:init env && \
    composer run migrate migrate:up env
