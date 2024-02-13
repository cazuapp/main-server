#!/usr/bin/perl

use strict;
use warnings;
use LWP::UserAgent;
use JSON;
use Term::ANSIColor;
use Getopt::Long;

# Set the endpoint URL
my $endpoint = 'http://127.0.0.1:3000/server/api/app/startup/ping';

# Create a user agent object
my $ua = LWP::UserAgent->new;

my $times = 1;

GetOptions(
    'times|t=i' => \$times,
) or die "Error in command line arguments\n";

for (my $i = 1; $i <= $times; $i++) {

    # Send a GET request to the endpoint
    my $response = $ua->get($endpoint);

    # Check for errors
    if ($response->is_success) 
    {
        # Decode the JSON response
        my $data = decode_json($response->content);

        # Extract the 'pong' value
        my $pong_time = $data->{data}->{pong};

        # Print the whole JSON response with formatted output
        printf "[ %s%s%s ] PONG!\n", color('green bold'), "OK", color('reset');
        printf "[ %s%s%s ] Time: %d ms\n", color('green bold'), "OK", color('reset'), $pong_time;
        printf "[ %s%s%s ] JSON: %s\n", color('green bold'), "OK", color('reset'), $response->content;
    } 
    else 
    {
        print "Error: ", $response->status_line, "\n";
    }
}
