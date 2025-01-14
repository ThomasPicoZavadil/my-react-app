/*****************
Soubor RecommendedArticles.js pro stránku zobrazující doporučené články
Autor - Tomáš Zavadil (xzavadt00)
*****************/

import React, { useState, useEffect } from "react";
import "./RecommendedArticles.css";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";

function RecommendedArticles() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]); // Stav pro doporučené články
    const [loading, setLoading] = useState(false); // Stav načítání
    const [bookmarks, setBookmarks] = useState(() => {
        // Načtení uložených záložek z localStorage
        const savedBookmarks = localStorage.getItem("bookmarks");
        return savedBookmarks ? JSON.parse(savedBookmarks) : [];
    });
    const [likedArticles, setLikedArticles] = useState(() => {
        // Načtení oblíbených článků z localStorage
        const savedLikes = localStorage.getItem("likedArticles");
        return savedLikes
            ? JSON.parse(savedLikes)
            : {
                likedKeywords: [],
                likedCategories: [],
                likedSources: [],
            };
    });

    // Funkce pro získání unikátních parametrů pro vyhledávání
    const getUniqueSearchParams = () => {
        const userAddedItems = JSON.parse(localStorage.getItem("userAddedItems")) || {
            categories: [],
            sources: [],
            keywords: [],
        };

        // Kombinace oblíbených a uživatelem přidaných parametrů
        const keywords = [...new Set([...likedArticles.likedKeywords, ...userAddedItems.keywords])];
        const categories = [...new Set([...likedArticles.likedCategories, ...userAddedItems.categories])];
        const sources = [...new Set([...likedArticles.likedSources, ...userAddedItems.sources])];

        return { keywords, categories, sources };
    };

    // Funkce pro načtení doporučených článků
    const fetchRecommendedArticles = async () => {
        setLoading(true);
        const { keywords, categories, sources } = getUniqueSearchParams();

        try {
            const results = [];

            for (const keyword of keywords) {
                const response = await axios.get(
                    `https://newsapi.org/v2/everything?q=${keyword}&apiKey=828bf842c33f483bb89259b6304ecbc5&pageSize=10`
                );
                results.push(...response.data.articles);
            }

            for (const category of categories) {
                const response = await axios.get(
                    `https://newsapi.org/v2/everything?q=${category}&apiKey=828bf842c33f483bb89259b6304ecbc5&pageSize=10`
                );
                results.push(...response.data.articles);
            }

            for (const source of sources) {
                const response = await axios.get(
                    `https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=828bf842c33f483bb89259b6304ecbc5&pageSize=10`
                );
                results.push(...response.data.articles);
            }

            setArticles(results);
        } catch (error) {
            console.error("Error fetching recommended articles:", error);
        }

        setLoading(false);
    };

    // Načtení článků při prvním načtení komponenty
    useEffect(() => {
        fetchRecommendedArticles();
    }, []);

    // Přidání/odebrání článku ze záložek
    const handleBookmark = (article) => {
        const isBookmarked = bookmarks.some((b) => b.url === article.url);
        if (isBookmarked) {
            setBookmarks(bookmarks.filter((b) => b.url !== article.url));
        } else {
            setBookmarks([...bookmarks, article]);
        }
    };

    // Kontrola, zda je článek v záložkách
    const isBookmarked = (article) => {
        return bookmarks.some((b) => b.url === article.url);
    };

    // Přidání článku do oblíbených
    const handleLikeArticle = (article) => {
        const articleInfo = {
            keyword: article.title || "Unknown Keyword",
            category: article.category || "General",
            source: article.source?.name || "Unknown Source",
        };

        setLikedArticles((prev) => {
            const updatedLikedArticles = { ...prev };

            if (!updatedLikedArticles.likedKeywords.includes(articleInfo.keyword)) {
                updatedLikedArticles.likedKeywords.push(articleInfo.keyword);
            }
            if (!updatedLikedArticles.likedCategories.includes(articleInfo.category)) {
                updatedLikedArticles.likedCategories.push(articleInfo.category);
            }
            if (!updatedLikedArticles.likedSources.includes(articleInfo.source)) {
                updatedLikedArticles.likedSources.push(articleInfo.source);
            }

            return updatedLikedArticles;
        });
    };

    // Přidání animace pro "To se mi líbí"
    const handleThumbClick = (e) => {
        const target = e.currentTarget;
        target.classList.add("thumb-clicked");
        setTimeout(() => {
            target.classList.remove("thumb-clicked");
        }, 300);
    };

    // Aktualizace localStorage při změně záložek
    useEffect(() => {
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    }, [bookmarks]);

    // Aktualizace localStorage při změně oblíbených článků
    useEffect(() => {
        localStorage.setItem("likedArticles", JSON.stringify(likedArticles));
    }, [likedArticles]);

    return (
        <div className="recommended-articles">
            <header className="header">
                <FaHome
                    size={80}
                    className="home-icon"
                    title="Go to Home"
                    onClick={() => navigate("/")}
                />
                <h1>Recommended Articles</h1>
            </header>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <Container>
                    {articles.length === 0 ? (
                        <p>No recommended articles found.</p>
                    ) : (
                        articles.map((article, index) => (
                            <Row className="d-flex justify-content-center" key={index}>
                                <Col xs={12} md={10} lg={8} className="mt-5">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={article.url}
                                        className="card-link"
                                    >
                                        <Card>
                                            <Card.Body className="card-body">
                                                <Card.Title className="my-3">{article.title}</Card.Title>
                                                {article.urlToImage && (
                                                    <Card.Img
                                                        src={article.urlToImage}
                                                        className="small-image"
                                                    />
                                                )}
                                            </Card.Body>
                                            <Card.Footer>
                                                <Card.Text className="footer-content">
                                                    {article.description}
                                                </Card.Text>
                                                <div className="icon-container">
                                                    <i
                                                        className={`fas fa-bookmark ${isBookmarked(article) ? "bookmarked" : ""
                                                            }`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleBookmark(article);
                                                        }}
                                                        title={isBookmarked(article) ? "Remove Bookmark" : "Add Bookmark"}
                                                    ></i>
                                                    <i
                                                        className="fas fa-thumbs-up"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleThumbClick(e);
                                                            handleLikeArticle(article);
                                                        }}
                                                        title="Like this article"
                                                    ></i>
                                                </div>
                                            </Card.Footer>
                                        </Card>
                                    </a>
                                </Col>
                            </Row>
                        ))
                    )}
                </Container>
            )}
        </div>
    );
}

export default RecommendedArticles;
