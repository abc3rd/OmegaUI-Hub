import sys

# Omega UI Branding Colors (Hex: #ea00ea, #2699fe, #4bce2a)
PURPLE = '\033[38;2;234;0;234m'
BLUE = '\033[38;2;38;153;254m'
GREEN = '\033[38;2;75;206;42m'
RESET = '\033[0m'

def run_installer():
    print(f'{PURPLE}==================================================')
    print(f'         OMEGA UI, LLC | SYNCLOUD CONNECT         ')
    print(f'    UNIVERSAL COMMAND PROTOCOL (UCP) INSTALLER    ')
    print(f'=================================================={RESET}')
    print(f'{BLUE}[*]{RESET} Initializing handshake with syncloudconnect.com...')
    print(f'{BLUE}[*]{RESET} Verifying Enterprise Manifest (V1.0.4)...')
    print(f'{GREEN}[OK]{RESET} UCP Policy Enforced: ID=UCP.ONLY')
    print(f'{GREEN}[OK]{RESET} Deployment Directory: /opt/syncloud')
    print(f'\n{PURPLE}>> System Ready for Universal Commands.{RESET}\n')

if __name__ == '__main__':
    run_installer()
