package com.example.fullstack2.Controllers;

import com.example.fullstack2.config.SeoProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SeoController {
    private final SeoProperties seoProperties;

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robots() {
        String body = """
                User-agent: *
                Allow: /
                Disallow: /login
                Disallow: /register
                Disallow: /profile
                Disallow: /announcements/create
                                
                Sitemap: %s/sitemap.xml
                """.formatted(seoProperties.getBaseUrl());
        return ResponseEntity.ok(body.trim());
    }

    @GetMapping(value = {"/sitemap.xml", "/stampmap.xml"}, produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        String today = LocalDate.now().toString();
        List<SitemapUrl> urls = List.of(
                new SitemapUrl(seoProperties.getBaseUrl() + "/", "daily", "1.0", today),
                new SitemapUrl(seoProperties.getBaseUrl() + "/about", "weekly", "0.8", today)
        );

        String body = """
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                %s
                </urlset>
                """.formatted(urls.stream()
                .map(url -> """
                        <url>
                          <loc>%s</loc>
                          <lastmod>%s</lastmod>
                          <changefreq>%s</changefreq>
                          <priority>%s</priority>
                        </url>
                        """.formatted(url.loc(), url.lastmod(), url.changefreq(), url.priority()))
                .reduce("", String::concat));

        return ResponseEntity.ok(body.trim());
    }

    private record SitemapUrl(String loc, String changefreq, String priority, String lastmod) {
    }
}
