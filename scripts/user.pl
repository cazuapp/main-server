#!/usr/bin/perl

use strict;
use warnings;
use LWP::UserAgent;
use Getopt::Long;
use JSON::PP;
use Term::ANSIColor;  # Added for color formatting
use Time::HiRes qw(gettimeofday tv_interval);

# Define the API endpoint
my $API = "http://localhost:3000/server/api/app/noauth/signup";

# Default user information
my $DEFAULT_EMAIL = 'test@cazuapp.dev';

my $times = 1;

GetOptions(
    'times|t=i' => \$times,
) or die "Error in command line arguments\n";

# Create a UserAgent object for making HTTP requests
my $ua = LWP::UserAgent->new;

# Set a timeout for the request (in seconds)
$ua->timeout(10);

# Track the start time
my $start_time = [gettimeofday];

for (my $i = 1; $i <= $times; $i++) {
    # Generate random email if -t option is provided
    my $EMAIL = $times > 1 ? generate_random_email() : $DEFAULT_EMAIL;

    # User data as a hash
    my %user_data = (
        lang       => "en",
        email      => $EMAIL,
        password   => "password",
        first      => generate_random_name(),
        last       => generate_random_last(),
        phone_code => 1,
        phone      => 12345,
    );

    # Convert the hash to JSON format
    my $json = JSON::PP->new->utf8->encode(\%user_data);

    # Perform the HTTP POST request
    my $response = $ua->post(
        $API,
        Content_Type => 'application/json',
        Content      => $json,
        'User-Agent' => 'CazuClient'
    );

    if ($response->is_success) {
        printf "[ %s%s%s ] Created email ($i): $EMAIL\n", color('green bold'), "OK", color('reset');

    } elsif ($response->code == 405) {
        printf "[ %s%s%s ] Error occurred for: $EMAIL\n", color('red bold'), "ERROR", color('reset');
    } else {
        printf "[ %s%s%s ] Error: Unable to connect to the server\n", color('red bold'), "FAILED", color('reset');
        exit 1;
    }
}

# Calculate and print the time elapsed
my $elapsed_time = tv_interval($start_time);

if ($elapsed_time >= 60) {
    my $elapsed_minutes = $elapsed_time / 60;
    printf "\n[ %s%s%s ] Time Elapsed: %.4f minutes\n", color('green bold'), "OK", color('reset'), $elapsed_minutes;
} else {
    printf "\n[ %s%s%s ] Time Elapsed: %.4f seconds\n", color('green bold'), "OK", color('reset'), $elapsed_time;
}

sub generate_random_email {
    my $random_string = join('', ('a'..'z')[rand 26, rand 26, rand 26, rand 26, rand 26]);
    return "$random_string\@cazuapp.dev";
}

sub generate_random_name {
    my $random_string = join('', ('a'..'z')[rand 26, rand 26, rand 26, rand 26, rand 26]);
    return ucfirst($random_string);
}

sub generate_random_last {
    my $random_string = join('', ('a'..'z')[rand 26, rand 26, rand 26, rand 26, rand 26]);
    return ucfirst($random_string);
}
