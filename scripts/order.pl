#!/usr/bin/perl
use strict;
use warnings;
use LWP::UserAgent;
use JSON;
use Getopt::Long;
use Time::HiRes qw(gettimeofday tv_interval);
use Term::ANSIColor;

my $times = 1;

GetOptions(
    'times|t=i' => \$times,
) or die "Error in command line arguments\n";

# Default values
my $login_url = 'http://127.0.0.1:3000/server/api/app/noauth/login';
my $order_url = 'http://127.0.0.1:3000/server/api/app/orders/add';

# Start time for the entire script
my $script_start_time = [gettimeofday];

# Login credentials
my $login_data = {
    email    => 'admin@cazuapp.dev',
    password => 'password'
};

# Convert login data to JSON
my $json_login_data = encode_json($login_data);

# Create a user agent object for login
my $ua_login = LWP::UserAgent->new;
# Set a timeout for the request (in seconds)
$ua_login->timeout(10);

# Create an HTTP request for login
my $login_request = HTTP::Request->new(POST => $login_url);
$login_request->header('Content-Type' => 'application/json');
$login_request->content($json_login_data);

# Make the login request
my $login_start_time = [gettimeofday];
my $login_response   = $ua_login->request($login_request);

# Track the start time
my $start_time = [gettimeofday];

# Check if login was successful
if ($login_response->is_success) {
    my $login_response_data = decode_json($login_response->decoded_content);
    my $token              = $login_response_data->{login}->{token};

    for (my $i = 1; $i <= $times; $i++) {
        # Create a random variant and quantity
        my $variant  = int(rand(5)) + 1;
        my $quantity = int(rand(5)) + 1;
        my $variant2  = int(rand(5)) + 1;
        my $quantity2 = int(rand(5)) + 1;
        

        # Construct the payload
        my $payload = {
            "items"   => [{
                "variant"  => $variant,
                "quantity" => $quantity,
            },
            {
                "variant"  => $variant2,
                "quantity" => $quantity2,
            }            
            ],
            "address" => 1,
            "payment" => 1
        };

        # Convert the payload to JSON
        my $json_payload = encode_json($payload);

        # Create a user agent object for orders
        my $ua_orders = LWP::UserAgent->new;

        # Create an HTTP request for orders
        my $order_request = HTTP::Request->new(POST => $order_url);
        $order_request->header('Content-Type' => 'application/json');
        $order_request->header('Authorization' => "$token");
        $order_request->content($json_payload);

        # Make the order request
        my $order_start_time = [gettimeofday];
        my $response   = $ua_orders->request($order_request);
        my $order_elapsed    = tv_interval($order_start_time);

        if ($response->is_success) 
        {
           my $order_result = decode_json($response->decoded_content);
           my $order_id     = $order_result->{data}->{id};
           my $order_status = $order_result->{data}->{status};
           my $order_total = $order_result->{data}->{total};
           my $order_shipping = $order_result->{data}->{shipping};
           
           printf "[ %s%s%s ] Created order ($i): Order ID: %d, Status: %s, Total: \$%s, Shipping: \$%s\n", color('green bold'), "OK", color('reset'), $order_id, $order_status, $order_total, $order_shipping;
   
        } elsif ($response->code == 405) {
            printf "[ %s%s%s ] Error occurred for: order $i\n", color('red bold'), "ERROR", color('reset');
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
} else {
    printf "[ %s%s%s ] Error: Login failed\n", color('red bold'), "FAILED", color('reset');
    exit 1;
}
