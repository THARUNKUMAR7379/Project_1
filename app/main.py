from app.backend.app import get_app

app = get_app()

if __name__ == '__main__':
    app.run(debug=True) 