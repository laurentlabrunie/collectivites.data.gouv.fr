from unidecode import unidecode
import re

'''
library to expose useful methods for address like

    guess_typeof_street:
        evaluate type of street (from its label, splited as words)
    guess_strong_word:
        evaluate strong word (from its label, splited as words)
'''

# I to XXIII : ^[X]*(I{1,3}|[I]?V|V[I]{0,3}|[I]?X)$
# all : '^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$'
IS_ROMAN_NUMBER_RE = re.compile(r'^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$', re.I)

def is_roman_number(word):
    """
    determine if given word is a roman number
    :param word:
    :return: boolean result
    """
    roman = IS_ROMAN_NUMBER_RE.match(word)
    return (roman != None)


def is_numeric(word):
    """
    determine if given word is a number
    :param word:
    :return: boolean result
    """
    try:
        integer = int(word)
    except ValueError as e:
        return False
    return True


class AddrGroup:
    """
    class Address of level Group (Voie, Lieu-dit, Quartier)
    """

    # typeof street as list of key words, sorted by descendant number of occurences
    TYPEOF_STREET_VALUES = [
        'RUE'
        , 'LIEU DIT'
        , 'CHEMIN'
        , 'IMPASSE'
        , 'ROUTE'
        , 'ALLEE'
        , 'PLACE'
        , 'AVENUE'
        , 'LOTISSEMENT'
        , 'QUARTIER'
        , 'RESIDENCE'
        , 'BOULEVARD'
        , 'RUELLE'
        , 'SQUARE'
        , 'PASSAGE'
        , 'HAMEAU'
        , 'MOULIN'
        , 'FERME'
        , 'SENTE'
        , 'CITE'
        , 'CHEZ'
        , 'CLOS'
        , 'DOMAINE'
        , 'MONTEE'
        , 'MAS'
        , 'CHATEAU'
        , 'COUR'
        , 'QUAI'
        , 'TRAVERSE'
        , 'ZONE ARTISANALE'
        , 'PONT'
        , 'BOIS'
        , 'ROND POINT'
        , 'VOIE'
        , 'VILLA'
        , 'COTE'
        , 'VENELLE'
        , 'VILLAGE'
        , 'PARC'
        , 'COURS'
        , 'PROMENADE'
        , 'ZONE INDUSTRIELLE'
        , 'IMMEUBLE'
        , 'PETITE RUE'
        , 'HLM'
        , 'PRE'
        , 'CARREFOUR'
        , 'ESPLANADE'
        , 'CENTRE COMMERCIAL'
        , 'PLAN'
        , 'MAIL'
        , 'ECLUSE'
        , 'FAUBOURG'
        , 'ANCIEN CHEMIN'
        , 'VAL'
        , 'ESPACE'
        , 'MAISON FORESTIERE'
        , 'ZONE D AMENAGEMENT CONCERTE'
        , 'CAMP'
        , 'PORT'
        , 'ZONE'
        , 'CAMPAGNE'
        , 'GRAND RUE'
        , 'CHAUSSEE'
        , 'PLAINE'
        , 'ESCALIER'
        , 'ANCIENNE ROUTE'
        , 'JARDIN'
        , 'BOURG'
        , 'ETANG'
        , 'MANOIR'
        , 'COL'
        , 'PORTE'
        , 'FONTAINE'
        , 'ROC'
        , 'CAMPING'
        , 'RAMPE'
        , 'BOUCLE'
        , 'CORNICHE'
        , 'AIRE'
        , 'CARRIERE'
        , 'CENTRAL'
        , 'ILE'
        , 'PAVILLON'
        , 'PETIT CHEMIN'
        , 'VIEUX CHEMIN'
        , 'GARE'
        , 'DESCENTE'
        , 'ENCLOS'
        , 'TOUR'
        , 'PARVIS'
        , 'PARKING'
        , 'GALERIE'
        , 'PLATEAU'
        , 'TERRASSE'
        , 'CAVEE'
        , 'CHALET'
        , 'CASTEL'
        , 'POINTE'
        , 'ENCEINTE'
        , 'VIEILLE ROUTE'
        , 'CONTOUR'
        , 'FORT'
        , 'PASSERELLE'
        , 'ABBAYE'
        , 'PASSE'
        , 'PLAGE'
        , 'TERRAIN'
        , 'STATION'
        , 'DIGUE'
        , 'CHAPELLE'
        , 'FOSSE'
        , 'CHEMINEMENT'
        , 'BARRIERE'
        , 'LEVEE'
        , 'GROUPE'
        , 'REMPART'
        , 'TERTRE'
        , 'VIA'
        , 'PASSAGE A NIVEAU'
        , 'CARRE'
        , 'PETITE ROUTE'
        , 'ANSE'
        , 'BUTTE'
        , 'FOYER'
        , 'MARCHE'
        , 'PLACIS'
        , 'COLLINE'
        , 'COTTAGE'
        , 'STADE'
        , 'AUTOROUTE'
        , 'EGLISE'
        , 'CALE'
        , 'RACCOURCI'
        , 'PRESQU ILE'
        , 'TERRE PLEIN'
        , 'AGGLOMERATION'
        , 'CARREAU'
        , 'GARENNE'
        , 'ARCADE'
        , 'CHEMIN VICINAL'
        , 'HALLE'
        , 'BERGE'
        , 'GRILLE'
        , 'PETITE AVENUE'
        , 'PALAIS'
        , 'FORUM'
        , 'PETITE ALLEE'
        , 'BASTIDE'
        , 'PETITE IMPASSE'
        , 'POURTOUR'
        , 'DEGRE'
        , 'BEGUINAGE'
        , 'CLOITRE'
        , 'MUSEE'
        , 'PATIO'
        , 'RAIDILLON'
        , 'ROTONDE'
        , 'JETEE'
        , 'POTERNE'
        , 'NOUVELLE ROUTE'
        , 'ROQUET'
        , 'PORTIQUE'
        , 'PERISTYLE'
        , 'BAS CHEMIN'
        , 'PERIPHERIQUE'
        , 'METRO'
        , 'HIPPODROME'
        , 'DARSE'
        , 'GRIMPETTE'
        , 'HAUT CHEMIN'
        , 'CHARMILLE'
        , 'GRAND BOULEVARD'
        , 'GROUPEMENT'
        , 'ZONE D AMENAGEMENT DIFFERE'
        , 'ZONE A URBANISER EN PRIORITE'
        , 'BASTION'
        , 'ENCLAVE'
    ]

    STRONG_WORD_EXCLUDE_LAPOSTE = [
        'INFERIEUR'
        , 'INFERIEURE'
        , 'INFERIEURS'
        , 'INFERIEURES'
        , 'SUPERIEUR'
        , 'SUPERIEURE'
        , 'SUPERIEURS'
        , 'SUPERIEURES'
        , 'PROLONGE'
        , 'PROLONGEE'
        , 'PROLONGEES'
    ]

    STRONG_WORD_EXCLUDE_IGN = [
        'PAIR'
        , 'PAIRE'
        , 'IMPAIR'
        , 'IMPAIRE'
        , 'BIS'
        , 'TER'
        , 'QUATER'
        , 'NO'
        , 'NR'
        , 'NORD'
        , 'EST'
        , 'SUD'
        , 'OUEST'
        , 'HAMEAU'
        , 'SUR'
        , 'SOUS'
        , 'HAUT'
        , 'HAUTS'
        , 'HAUTE'
        , 'HAUTES'
        , 'BAS'
        , 'BASSE'
        , 'BASSES'
        , 'BRAZ'
        , 'VRAZ'
        , 'BRAS'
        , 'VRAS'
        , 'BIHAN'
        , 'VIHAN'
        , 'BIAN'
        , 'VIAN'
        , 'HUEL'
        , 'IZEL'
        , 'HUELLA'
        , 'UHELLA'
        , 'IZELLA'
        , 'H'
        , 'PELLA'
        , 'TOSTA'
        , 'NEVEZ'
        , 'NEVE'
        , 'NEHUE'
        , 'NEUE'
        , 'AL'
        , 'AR'
        , 'AN'
        , 'ER'
        , 'UR'
        , 'UN'
        , 'COZ'
        , 'CREIS'
        , 'KREIS'
        , 'CREIZ'
        , 'KREIZ'
        , 'DU'
        , 'IHUEL'
        , 'UHEL'
        , 'GUEN'
        , 'GWEN'
    ]

    ARTICLES_VALUES = [
        'LE'
        , 'LA'
        , 'LES'
        , 'L'
        , 'DE'
        , 'DU'
        , 'DES'
        , 'D'
        , 'A'
        , 'AU'
        , 'AUX'
        , 'UN'
        , 'UNE'
    ]

    # eval number of word(s) for each
    TYPEOF_STREET_WORDS_COUNT = [x.count(" ") + 1 for x in TYPEOF_STREET_VALUES]

    IS_WELL_CAPITALIZE_RE = re.compile(r'^(?:[A-Z][a-z]*[- \']?)$')
    IS_ONLY_UPPERCASE_RE = re.compile(r'^[- \'A-Z]*$')
    IS_WITH_REPETITION_RE = re.compile(r'(?P<word>\w+)\W+(?P=word)', re.I)
    SPLIT_LABEL_AS_WORD_RE = re.compile(r"[\w]+", re.U | re.X)

    LABEL_ONLY_UPPERCASE_ERROR = 1
    LABEL_BAD_CAPITALIZE_ERROR = 2
    LABEL_WITH_REPETITION_ERROR = 4


    def __init__(self, label, evalDescriptor=False):
        self.label = label
        # split as word(s), transforming accents (unidecode)
        self._words = self.SPLIT_LABEL_AS_WORD_RE.findall(unidecode(self.label))
        self._wordsUpper = list(map(lambda x: x.upper(), self._words))


    def _guess_strong_word(self):
        """
        evaluate strong word of a label of street, from splited words
        :return: strong word
        """

        # not a roman number
        # not an arabic number
        # not an excluded word (LAPOSTE, IGN)
        # not an article
        excludes = (self.STRONG_WORD_EXCLUDE_LAPOSTE + self.STRONG_WORD_EXCLUDE_IGN
                           + self.ARTICLES_VALUES)
        for word in reversed(self._wordsUpper):
            if is_roman_number(word) or is_numeric(word) or word in excludes:
                continue
            return word

        # default is last word
        return self._wordsUpper[-1]


    def _guess_typeof_street(self):
        """
        identify type of street (tos) of label, from splited words
        :return: type of street
        """

        '''
        bugs:
        1- <tos> <exclude_word> gives <tos> instead of <exclude_word>
        '''
        t = len(self._wordsUpper)
        for i, kw in enumerate(self.TYPEOF_STREET_VALUES):
            if self.TYPEOF_STREET_WORDS_COUNT[i] >= t:
                continue

            # multiple tos w/ the same 1st word, search them starting w/ longest (loop w/ desc order)
            if self._wordsUpper[0] in ("CHEMIN", "ZONE", "PASSAGE"):
                w = [(s, self.TYPEOF_STREET_VALUES.index(s)) for s in self.TYPEOF_STREET_VALUES
                        if s.startswith(self._wordsUpper[0])]
                ws = sorted(w, key=lambda x: self.TYPEOF_STREET_WORDS_COUNT[x[1]], reverse=True)
                for tos, id in ws:
                    if " ".join(self._wordsUpper[:self.TYPEOF_STREET_WORDS_COUNT[id]]) == tos:
                        return tos
            else:
                if " ".join(self._wordsUpper[:self.TYPEOF_STREET_WORDS_COUNT[i]]) == kw:
                    return kw

        # w/o type of street
        return ''


    def _guess_stateof_label(self):
        """
        evaluate state of label (suspicious errors)
        :return: bitstream
        """
        rc = 0

        # only w/ uppercase?
        ouc = self.IS_ONLY_UPPERCASE_RE.match(self.label)
        if (ouc != None):
            rc |= self.LABEL_ONLY_UPPERCASE_ERROR
        else:
            # each word well capitalized?
            for w in self._words:
                if w.upper() in self.ARTICLES_VALUES or is_roman_number(w) or is_numeric(w):
                    continue
                wc = self.IS_WELL_CAPITALIZE_RE.match(w)
                if (wc == None):
                    rc |= self.LABEL_BAD_CAPITALIZE_ERROR
                    break

        # w/ duplicate successive word?
        dup = self.IS_WITH_REPETITION_RE.search(street)
        if (dup != None):
            rc |= self.LABEL_WITH_REPETITION_ERROR

        return rc


    @property
    def guess_strong_word(self):
        if not hasattr(self, '_strong_word'):
            self._strong_word = self._guess_strong_word()
        return self._strong_word


    @property
    def guess_typeof_street(self):
        if not hasattr(self, '_typeof_street'):
            self._typeof_street = self._guess_typeof_street()
        return self._typeof_street


    @property
    def is_label_only_uppercased(self):
        if not hasattr(self, '_stateof_label'):
            self._stateof_label = self._guess_stateof_label()
        return ((self._stateof_label & self.LABEL_ONLY_UPPERCASE_ERROR) == self.LABEL_ONLY_UPPERCASE_ERROR)


    @property
    def is_label_bad_capitalized(self):
        if not hasattr(self, '_stateof_label'):
            self._stateof_label = self._guess_stateof_label()
        return ((self._stateof_label & self.LABEL_BAD_CAPITALIZE_ERROR) == self.LABEL_BAD_CAPITALIZE_ERROR)


    @property
    def is_label_with_repetition(self):
        if not hasattr(self, '_stateof_label'):
            self._stateof_label = self._guess_stateof_label()
        return ((self._stateof_label & self.LABEL_WITH_REPETITION_ERROR) == self.LABEL_WITH_REPETITION_ERROR)


# for tests
if __name__ == '__main__':
    while True:
        street = input('\nEntrer la Voie: ')

        addr = AddrGroup(street)
        print('   mot important : ' + addr.guess_strong_word)
        print(' type de la Voie : ' + addr.guess_typeof_street)
        print(' état du libellé : ')
        if (addr.is_label_only_uppercased):
            print('  en majuscule seulement!')
        if (addr.is_label_bad_capitalized):
            print('  non correctement capitalisé!')
        if (addr.is_label_with_repetition):
            print('  avec redondance de libellé!')

