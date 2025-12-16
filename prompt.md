Please refactor this single HTML file project by splitting it into a standard web project structure to accommodate future development with the Python Flask framework. Specific Requirements:
File Separation:
Extract the inline HTML code into a templates/index.htmlfile.
Extract the CSS code from the <style>tag into a static/css/style.cssfile.
Extract the JavaScript code from the <script>tag into a static/js/script.jsfile.


Path Correction:​ Ensure the refactored HTML file correctly links to the new CSS and JS files (e.g., using {{ url_for('static', ...) }}or relative paths).
Project Structure:​ Create a clear project directory tree. The core structure should be as follows:
 your_project/
├── app.py              # Main Flask application file
├── requirements.txt    # Python dependencies file
├── templates/          # HTML templates directory
│   └── index.html
└── static/             # Static resources directory
    ├── css/
    │   └── style.css
    └── js/
        └── script.js


Flask Readiness:​ Provide basic Flask code in app.pythat can run and correctly render this frontend page.
Please first show the separated project structure, then provide the contents of the key files (templates/index.html, static/css/style.css, static/js/script.js, app.py).
