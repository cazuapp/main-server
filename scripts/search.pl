#!/usr/bin/perl

use strict;
use warnings;
use LWP::UserAgent;
use JSON;
use Getopt::Long;
use Term::ANSIColor;
use Time::HiRes qw(gettimeofday tv_interval);

# Variables for command line options
my $limit = 100;  # Default value
my $offset = 0; # Default value

# Parsing command line options
GetOptions(
    'limit|l=i' => \$limit,
    'offset|o=i' => \$offset,
) or die "Error in command line arguments\n";

# Check if the to_search value is provided
my $to_search = shift @ARGV || die "Usage: $0 to_search --limit [limit] --offset [offset]\n";

my $login_url = 'http://127.0.0.1:3000/server/api/app/noauth/login';

my $search_url = 'http://127.0.0.1:3000/server/api/app/managed/users/search';

# Create a user agent object
my $ua = LWP::UserAgent->new;
$ua->timeout(10);

# Start time for the operation
my $start_time = [gettimeofday];

# Perform login
my $login_response = $ua->post($login_url, 'Content-Type' => 'application/json', Content => encode_json({ email => 'admin@cazuapp.dev', password => 'password' }));
if (!$login_response->is_success) {
    printf "[ %s%s%s ] Error: Login failed\n", color('red bold'), "FAILED", color('reset');
    exit 1;
}

my $login_response_data = decode_json($login_response->decoded_content);
my $token = $login_response_data->{login}->{token};

# Prepare search data
my $search_data = {
    value  => $to_search,
    limit  => int($limit),
    offset => int($offset)
};

# Perform search
my $search_response = $ua->post($search_url, 
    'Content-Type' => 'application/json', 
    'Authorization' => "$token", 
    Content => encode_json($search_data));

if (!$search_response->is_success) {
    printf "[ %s%s%s ] Error: Search failed\n", color('red bold'), "FAILED", color('reset');
    exit 1;
}

# Output successful request message
printf "[ %s%s%s ] Request successful\n", color('green bold'), "OK", color('reset');

my $search_response_data = decode_json($search_response->decoded_content);
my $fix = 94;

# Output the results in columns with divisors and separators
print '-' x $fix . "\n";
printf("| %-15s | %-27s | %-37s | %-38s |\n", colored("ID", 'yellow'), colored("Name", 'cyan'), colored("Email", 'magenta'), colored("Created", 'blue'));
print '-' x $fix . "\n";
foreach my $user (@{$search_response_data->{data}}) {
    printf("| %-6d | %-18s | %-28s | %-29s |\n", 
        $user->{id}, 
        $user->{first} . ' ' . $user->{last}, 
        $user->{email}, 
        $user->{created});
}

# Calculate and print the time elapsed
my $elapsed_time = tv_interval($start_time);
if ($elapsed_time >= 60) {
    my $elapsed_minutes = $elapsed_time / 60;
    printf "\n[ %s%s%s ] Total Time Elapsed: %.4f minutes\n", color('green bold'), "OK", color('reset'), $elapsed_minutes;
} else {
    printf "\n[ %s%s%s ] Total Time Elapsed: %.4f seconds\n", color('green bold'), "OK", color('reset'), $elapsed_time;
}
