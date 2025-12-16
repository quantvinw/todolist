# Repository Guidelines

## Project Structure & Module Organization
The Flask entry point is `app.py`, which wires routes to Jinja templates. UI markup lives in `templates/index.html`, while all styling and client logic sit inside `static/css/style.css` and `static/js/script.js`. Keep additional templates or assets under the same folders so `url_for('static', ...)` references remain consistent. Store configuration (e.g., future database URIs) in environment variables rather than hard-coding them in `app.py`.

## Build, Test, and Development Commands
- `python -m venv .venv && source .venv/bin/activate`: create and activate an isolated environment.
- `pip install -r requirements.txt`: install Flask (and any future dependencies) exactly as pinned.
- `python app.py` or `flask --app app run --debug`: start the development server with hot reload at `http://127.0.0.1:5000`.
When touching static assets, simply refresh the browser; no bundler is involved.

## Coding Style & Naming Conventions
Follow standard Python conventions (PEP 8, 4-space indentation, snake_case identifiers). Keep routes slim and push presentation concerns into templates. In templates, prefer semantic HTML and the existing `Inter` font stack. CSS already relies on custom properties; add new colors via variables near the top of `static/css/style.css`. JavaScript uses `const`/`let`, arrow functions, and descriptive state keys—mirror that tone and escape user input with `escapeHtml` before DOM insertion.

## Testing Guidelines
No automated tests exist yet, so every change requires manual verification by loading the page, adding tasks, toggling filters, and checking persistence via `localStorage`. New server-side features should ship with `pytest` modules under `tests/` (named `test_*.py`) and run via `python -m pytest`. For front-end logic, consider lightweight DOM tests with `pytest` + `pytest-playwright` or Cypress before introducing regressions.

## Commit & Pull Request Guidelines
Past history (`git log`) uses short, imperative messages (e.g., "first commit"). Follow that style: summarize intent in one line, optionally add wrapped details after a blank line. Pull requests should describe the motivation, list key changes, mention testing performed (`python app.py`, manual browser QA), and reference related issues. Include screenshots or GIFs for UI tweaks so reviewers can confirm layout changes quickly.
