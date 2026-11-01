package io.freemytv;

/**
 * The home screen's measures for each look (Home Settings > Appearance), in HomeView's 1920×1080 space (times k).
 * HomeView picks one when it lays the screen out, never while drawing. Classic is the screen as it always was; Nova
 * (design/200, card 202) keeps every text and focusable item inside the 5% safe area (96 px at the sides, 60 at the
 * top and bottom), puts the tabs, the round buttons and a small clock on one top bar, and no text under 24 px.
 */
final class HomeLayout {
    static final HomeLayout CLASSIC = new HomeLayout(false), NOVA = new HomeLayout(true);

    final boolean nova;
    /** The content's left and right edges. */
    final float margin, contentR;
    /** "For You" / "Continue Watching": baseline and size. */
    final float titleBase, titleSize;
    /** The tabs' pills: top, height, how far the first starts left of the margin, the text's padding inside, the gap
     *  between them, and the text size. */
    final float tabTop, tabH, tabOut, tabPad, tabGap, tabSize;
    /** The round buttons: diameter, gap, center line, symbol size; the focused one's name: offset under it and size. */
    final float button, buttonGap, buttonCy, buttonSymbol, tipDy, tipSize;
    /** The top bar's clock (Nova only; 0 in Classic) and its gap to the buttons. */
    final float barClockSize, barClockGap;
    /** Center line of the quotes (or what's playing) beside the tabs (Classic) or the title (Nova). */
    final float quoteRowCy;
    /** How far the shelf's glass keeps its tiles from the content's edges (Nova: the glass stays in the safe area). */
    final float shelfInset;
    /** The smallest text on the home screen (0: as each paint says). */
    final float minText;

    private HomeLayout(boolean nova) {
        this.nova = nova;
        if (!nova) {
            margin = 80;
            contentR = 1840;
            titleBase = 130;
            titleSize = 76;
            tabTop = 158;
            tabH = 68;
            tabPad = 26;
            tabOut = tabPad;   // the first tab's text at the margin
            tabGap = 4;
            tabSize = 30;
            button = 68;
            buttonGap = 20;
            buttonCy = 103;
            buttonSymbol = 27;
            tipDy = 40;
            tipSize = 25;
            barClockSize = 0;
            barClockGap = 0;
            quoteRowCy = tabTop + tabH / 2;
            shelfInset = 0;
            minText = 0;
        } else {
            margin = 96;
            contentR = 1824;
            // The top bar: y = 60, 64 high (center 92); the title goes under it, above the picks (262).
            titleBase = 222;
            titleSize = 52;
            tabTop = 64;
            tabH = 56;
            tabPad = 24;
            tabOut = 0;        // the first tab's pill at the margin (it takes focus: inside the safe area)
            tabGap = 8;
            tabSize = 28;
            button = 64;
            buttonGap = 20;
            buttonCy = 92;
            buttonSymbol = 28;
            tipDy = 34;
            tipSize = 24;
            barClockSize = 34;
            barClockGap = 32;
            quoteRowCy = 203;   // the title's line, at its cap's middle
            shelfInset = 40;    // HomeView.SHELF_PAD
            minText = 24;
        }
    }

    /** A text size in this look: never under minText. */
    float text(float size) {
        return Math.max(minText, size);
    }
}
