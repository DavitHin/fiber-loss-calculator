# Fiber Optic Loss Calculator

A web-based tool to calculate fiber optic link loss budgets, originally built with Tkinter, now converted to Flask for browser accessibility.

## Features
- Calculate loss budgets for OS2, OM3, OM4, and OM5 fibers.
- Supports multiple wavelengths per fiber type.
- Includes an OTDR guide with standards references.
- Preserves original GUI functionality in a web format.

## Prerequisites
- Python 3.6+
- Git

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fiber-optic-loss-calculator.git
   cd fiber-optic-loss-calculator
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running Locally
1. Start the Flask app:
   ```bash
   python app.py
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Optional
- Place an `otdr_example.png` file in `static/images/` to display an example OTDR trace in the instructions page.

## Deployment
For broader access, deploy to a platform like Heroku:
1. Install Heroku CLI.
2. Login and create an app:
   ```bash
   heroku login
   heroku create your-app-name
   ```
3. Deploy:
   ```bash
   git push heroku main
   ```

## License
MIT