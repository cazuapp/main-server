#!/usr/bin/perl

use strict;
use warnings;
use LWP::UserAgent;
use JSON::PP;  # JSON::PP is used for encoding data to JSON format

# Define the API endpoint
my $API = "http://127.0.0.1:3000/server/api/app/setup/install";

# Configuration parameters
my %config = (
    skip               => 0,
    base_url           => "http://127.0.0.1:3000",
    online             => 1,
    lat                => 37.422131,
    lon                => -122.084801,
    contact            => 'contact@cazuapp.dev',
    orders             => 1,
    url                => "http://www.cazuapp.dev",
    store_address_name => "Main Road",
    store_address      => "1 Cazu road",
    instagram          => "cazuapp",
    shipping           => 10,
    facebook           => "cazuapp",
    twitter            => "cazuapp",
    currency           => "USD",
    tax                => 7,
    store_tagline      => "Your store at convenience",
    store_name         => "CazuApp",
    email              => 'admin@cazuapp.dev',
    password           => "password",
    first              => "D.B",
    last               => "Cooper",
    phone              => 123456,
    phone_code         => 1,
);

# Create a UserAgent object for making HTTP requests
my $ua = LWP::UserAgent->new;

# Convert the hash to JSON format
my $json = JSON::PP->new->utf8->encode(\%config);

# Perform the HTTP POST request
my $response = $ua->post(
    $API,
    Content_Type => 'application/json',
    Content      => $json,
    'User-Agent' => 'CazuApp'
);

# Check if the request was successful
if ($response->is_success) {
    print $response->decoded_content;
} else {
    die $response->status_line;
}
