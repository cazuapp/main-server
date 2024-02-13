#!/usr/bin/perl

use strict;
use warnings;
use LWP::UserAgent;
use HTTP::Request;
use JSON;
use Time::HiRes qw(gettimeofday tv_interval);
use Getopt::Long;
use Term::ANSIColor;  # Added for color formatting

# Initialize variables
my $token_only = 0;

# Get command line options
GetOptions('l' => \$token_only);

# API endpoint URLs
my $login_api_url = 'http://127.0.0.1:3000/server/api/app/noauth/login';
my $get_home_url  = 'http://127.0.0.1:3000/server/api/app/home/get';

# JSON data for login request
my $json_data = {
    email    => 'admin@cazuapp.dev',
    password => 'password'
};

# Encode JSON data
my $json_encoded = encode_json($json_data);

# Create a user agent object
my $ua = LWP::UserAgent->new(timeout => 10);

# Record the start time
my $start_time = [gettimeofday];

# --- Login Request ---

# Create a POST request for login
my $login_request = HTTP::Request->new(POST => $login_api_url);
$login_request->header('Content-Type' => 'application/json');
$login_request->content($json_encoded);

# Send the login request and get the response
my $login_response = $ua->request($login_request);

# Check for errors in the login response
unless ($login_response->is_success) {
    printf "[ %s%s%s ] Error: Unable to connect\n", color('red bold'), "FAILED", color('reset');
    
    exit 1;
}

# Decode JSON login response
my $login_response_data = decode_json($login_response->decoded_content);
my $token              = $login_response_data->{login}->{token};
my $id                 = $login_response_data->{login}->{id};
my $email              = $login_response_data->{login}->{email};

if ($token_only) {
    printf("%s\n", $token);
    exit;
}

printf "[ %s%s%s ] Logged as $email (id: $id) \n\n", color('green bold'), "OK", color('reset');

# --- Get Items Request ---

# JSON data for the request body, including LIMIT
my $get_json_data = {
    limit => 100,
    id    => 0
};

# Encode JSON data
my $get_json_encoded = encode_json($get_json_data);

# Create a POST request for getting items
my $get_request = HTTP::Request->new(POST => $get_home_url);
$get_request->header('authorization' => $token);
$get_request->header('Content-Type'  => 'application/json');
$get_request->content($get_json_encoded);

# Send the get items request and get the response
my $get_response = $ua->request($get_request);

# Check for errors in the get items response
unless ($get_response->is_success) {

    if ($get_response->code == 500) {
            printf "[ %s%s%s ] Error: Unable to connect to the server\n", color('red bold'), "FAILED", color('reset');

    } elsif ($get_response->code == 408) {
        printf "[ %s%s%s ] Error: request timeout", color('red bold'), "FAILED", color('reset');
        
    } else {
        printf "[ %s%s%s ] Error: Unable to connect to the server $get_response->decoded_content\n", color('red bold'), "FAILED", color('reset');
        
    }
    exit 1;
}

# Decode JSON get items response
my $get_response_data = decode_json($get_response->decoded_content);

# Check if "data" key exists in the response and is an array reference
if (exists $get_response_data->{data} && ref $get_response_data->{data} eq 'ARRAY') {
    my $items = $get_response_data->{data};

    # Sort items by ID in descending order
    @$items = sort { $a->{id} <=> $b->{id} } @$items;

    # Print table header
    printf("| %-5s | %-20s | %-60s | \n", 'ID', 'Name', 'Description');
    printf("| %-5s | %-20s | %-60s | \n", '-' x 5, '-' x 20, '-' x 60);

    # Print table rows
    foreach my $item (@$items) {
        printf("| %-5s | %-20s | %-60s |\n", $item->{id}, $item->{name}, $item->{description});
    }

} else {
    printf("\n[ \e[0;30;47m ERROR \e[0m ] 'data' key not found or not an array reference in the response.\n");
}

# Record the end time
my $end_time = [gettimeofday];

# Calculate the elapsed time and round it to two decimal places
my $elapsed_time = tv_interval($start_time);

if ($elapsed_time >= 60) {
    my $elapsed_minutes = $elapsed_time / 60;
    printf "\n[ %s%s%s ] Time Elapsed: %.4f minutes\n", color('green bold'), "OK", color('reset'), $elapsed_minutes;
} else {
    printf "\n[ %s%s%s ] Time Elapsed: %.4f seconds\n", color('green bold'), "OK", color('reset'), $elapsed_time;
}

printf("\n");

