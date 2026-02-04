#!/usr/bin/env python3
"""
Simple HTTP server for serving Code Finder Pro landing page on Railway
"""
import http.server
import socketserver
import os

PORT = int(os.environ.get('PORT', 8080))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers if needed
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

Handler = MyHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running at http://0.0.0.0:{PORT}")
    print(f"Serving files from: {os.getcwd()}")
    httpd.serve_forever()
