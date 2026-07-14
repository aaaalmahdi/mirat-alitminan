# Deployment and field checklist

## Before merge

- [ ] `npm test` passes.
- [ ] Package rules are reviewed against the current official table.
- [ ] `CLINICAL_APPROVAL.md` is complete for official use.
- [ ] No unofficial government or health-centre logo is present.
- [ ] The disclaimer wording is approved.
- [ ] GitHub Pages source is set to **GitHub Actions**.
- [ ] The pull-request validation workflow passes.

## Functional test matrix

Test both female and male at ages:

```text
18, 29, 30, 39, 40, 44, 45, 49, 50, 65, 66, 70, 75
```

Also test:

- [ ] Blank age.
- [ ] Decimal age.
- [ ] Age 17 and 76.
- [ ] Gender not selected.
- [ ] Skip optional questions.
- [ ] Answer “Not sure”.
- [ ] Camera permission allowed.
- [ ] Camera permission denied.
- [ ] Face model/CDN unavailable.
- [ ] No face and multiple faces.
- [ ] Arabic and English.
- [ ] `?mode=kiosk` idle warning.
- [ ] `?admin=1` analytics access and clear confirmation.
- [ ] Information page does not request camera access.
- [ ] Local analytics remain aggregate only.

## Accessibility

- [ ] Zoom to 200%.
- [ ] Keyboard-only navigation.
- [ ] Visible focus on all controls.
- [ ] Screen-reader announcement of errors and screen titles.
- [ ] Reduced-motion preference.
- [ ] Text and controls remain usable on 320px width.
- [ ] Colour contrast reviewed with the official brand palette.

## QR and printing

- [ ] Mirror QR opens `/mirat-alitminan/`.
- [ ] Information QR opens `/mirat-alitminan/info.html`.
- [ ] No printed QR contains a version query.
- [ ] Four-module quiet zone remains visible.
- [ ] No logo overlaps QR modules.
- [ ] Test printed QR on iPhone Safari and Android Chrome.
- [ ] Test in bright and dim lighting.
- [ ] Test at the expected scanning distance.
- [ ] Print proof approved before mass printing.

## Devices

- [ ] iPhone Safari.
- [ ] Android Chrome.
- [ ] iPad Safari.
- [ ] Intended booth device and orientation.
- [ ] Camera and HTTPS behaviour on the final hosting domain.
