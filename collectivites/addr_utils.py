import re, sys, locale

'''
library to expose useful methods for address like

    guess_typeof_street:
        evaluate type of street (from its label, splited as words)
    guess_strong_word:
        evaluate strong word (from its label, splited as words)
'''

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

CHARS_TO_TRANSFORM_VALUES = {
    'a': ['à', 'ã', 'á', 'â'],
    'e': ['é', 'è', 'ê', 'ë'],
    'i': ['î', 'ï'],
    'u': ['ù', 'ü', 'û'],
    'o': ['ô', 'ö'],
    ' ': ["""'""", '-']
}

SIZE_TYPEOF_STREET_VALUES = len(TYPEOF_STREET_VALUES)
TYPEOF_STREET_WORDS_COUNT = [x.count(" ") + 1 for x in TYPEOF_STREET_VALUES]

# I to XXIII : ^[X]*(I{1,3}|[I]?V|V[I]{0,3}|[I]?X)$
# all : '^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$'
IS_ROMAN_NUMBER_RE = re.compile('^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$')


def tr_accent_punctuation(text):
    """
    transform accents and punctuations
    :param text: string to operate
    :return: result
    """
    for (char, to_transform) in CHARS_TO_TRANSFORM_VALUES.items():
        for item in to_transform:
            text = text.replace(item, char)
    return text


def split_as_listof_words(street):
    """
    split complete label as word(s)
    :param street: complete label
    :return: list of word(s)
    """
    return re.split('\s*', tr_accent_punctuation(street).upper())


def guess_typeof_street(words):
    """
    identify type of street from splited words of label
    :param words: list of word(s)
    :return: type of street
    """

    '''
    bugs:
    1- <tos> <exlcude_word> gives <tos> instead of 2nd
    2- <tos> where word of tos is multiple (as PASSAGE, PASSAGE A NIVEAU) gives 1st, w/o searching more!
    '''
    t = len(words)
    if t == 0:
        return None
    i = 0
    while i < SIZE_TYPEOF_STREET_VALUES:
        if TYPEOF_STREET_WORDS_COUNT[i] < t and \
                        " ".join(words[:TYPEOF_STREET_WORDS_COUNT[i]]) == TYPEOF_STREET_VALUES[i]:
            return TYPEOF_STREET_VALUES[i]
        i += 1

    # w/o type of street
    return ''


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


def guess_strong_word(words):
    """
    evaluate strong word from splited words of label
    :param words: list of word(s)
    :return: strong word
    """
    i = len(words) - 1
    if i < 0:
        return None
    while i >= 0:
        # not a roman number
        # not an arabic number
        # not an excluded word (LAPOSTE, IGN)
        # not an article
        if not is_roman_number(words[i]) and not is_numeric(words[i]):
            if words[i] not in STRONG_WORD_EXCLUDE_LAPOSTE and \
                            words[i] not in STRONG_WORD_EXCLUDE_IGN and \
                            words[i] not in ARTICLES_VALUES:
                return words[i]
        i -= 1

    # default is last word
    return words[-1]


# for tests
if __name__ == '__main__':
    while True:
        street = input('\nEntrer la Voie: ')
        words = split_as_listof_words(street)

        tos = guess_typeof_street(words)
        print(' type de Voie : ' + tos)

        sw = guess_strong_word(words)
        print(' mot important de la Voie : ' + sw)
