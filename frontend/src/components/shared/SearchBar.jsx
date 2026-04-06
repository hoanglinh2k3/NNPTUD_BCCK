import { useEffect, useState } from 'react';

function SearchBar({ placeholder, defaultValue = '', onSearch, className = '', buttonLabel = 'Search' }) {
  const [keyword, setKeyword] = useState(defaultValue);

  useEffect(() => {
    setKeyword(defaultValue);
  }, [defaultValue]);

  return (
    <form
      className={`search-bar ${className}`.trim()}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.(keyword);
      }}
    >
      <div className="search-bar-field">
        <span className="search-bar-kicker">Find</span>
        <input
          placeholder={placeholder}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>
      <button className="button button-primary" type="submit">
        {buttonLabel}
      </button>
    </form>
  );
}

export default SearchBar;
